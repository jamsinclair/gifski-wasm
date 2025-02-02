#[cfg(test)]
mod tests {
    use crate::encode;

    fn create_test_frame(width: u32, height: u32, color: u8) -> Vec<u8> {
        let size = (width * height * 4) as usize;
        let mut frame = Vec::with_capacity(size);
        for _ in 0..size / 4 {
            frame.extend_from_slice(&[color, color, color, 255]);
        }
        frame
    }

    #[test]
    fn test_basic_encoding() {
        let width = 2;
        let height = 2;
        let mut frames = Vec::new();

        // Create two simple frames (black and white)
        frames.extend_from_slice(&create_test_frame(width, height, 0));
        frames.extend_from_slice(&create_test_frame(width, height, 255));

        let result = encode(
            &frames,
            2, // num_of_frames
            width,
            height,
            Some(10), // fps
            None,     // frame_durations
            Some(80), // quality
            None,     // repeat
            None,     // resize_width
            None,     // resize_height
        );

        // Basic sanity check - ensure we get some output
        assert!(!result.is_empty());
        // Verify it starts with GIF89a header
        assert_eq!(&result[0..6], b"GIF89a");
    }

    #[test]
    #[should_panic(expected = "Only a single image file was given as an input")]
    fn test_single_frame_validation() {
        let frame = create_test_frame(2, 2, 0);
        encode(&frame, 1, 2, 2, Some(10), None, None, None, None, None);
    }

    #[test]
    fn test_frame_timing_with_durations() {
        let width = 2;
        let height = 2;
        let mut frames = Vec::new();
        frames.extend_from_slice(&create_test_frame(width, height, 0));
        frames.extend_from_slice(&create_test_frame(width, height, 255));

        let result = encode(
            &frames,
            2,
            width,
            height,
            None,                 // fps
            Some(vec![100, 200]), // frame_durations in ms
            None,
            None,
            None,
            None,
        );

        assert!(!result.is_empty());
    }

    #[test]
    #[should_panic(expected = "Either FPS or Frame Durations must be provided")]
    fn test_missing_timing_parameters() {
        let frames = create_test_frame(2, 2, 0);
        encode(
            &frames, 2, 2, 2, None, // fps
            None, // frame_durations
            None, None, None, None,
        );
    }

    #[test]
    #[should_panic(expected = "FPS and Frame Durations cannot be provided at the same time")]
    fn test_both_timing_parameters() {
        let frames = create_test_frame(2, 2, 0);
        encode(
            &frames,
            2,
            2,
            2,
            Some(10),             // fps
            Some(vec![100, 200]), // frame_durations
            None,
            None,
            None,
            None,
        );
    }

    #[test]
    #[should_panic(expected = "The number of frame durations provided does not match")]
    fn test_mismatched_frame_durations() {
        let frames = vec![0u8; 32]; // Two 2x2 frames
        encode(
            &frames,
            2,
            2,
            2,
            None,
            Some(vec![100]), // Only one duration for two frames
            None,
            None,
            None,
            None,
        );
    }
}
