#[cfg(feature = "parallel")]
pub use wasm_bindgen_rayon::init_thread_pool;

#[cfg(feature = "debug")]
extern crate console_error_panic_hook;
use wasm_bindgen::prelude::*;

use imgref::*;
use rgb::*;
use gifski_lite::*;
use std::io::Cursor;

#[wasm_bindgen]
pub fn encode(frames: &[u8], num_of_frames: usize, width: u32, height: u32, fps: u8, quality: Option<u8>, repeat: Option<i32>,  resize_width: Option<u32>, resize_height: Option<u32>) -> Vec<u8> {
    #[cfg(feature = "debug")]
    console_error_panic_hook::set_once();

    let mut buffer = Cursor::new(Vec::new());
    let _repeat = repeat.unwrap_or(-1);

    let settings = Settings {
        width: resize_width,
        height: resize_height,
        quality: quality.unwrap_or(100),
        fast: false, // TODO: Do we want to expose this? Does it have much of an impact?
        repeat: if _repeat >= 0 { Repeat::Finite(_repeat as u16) } else { Repeat::Infinite },
    };

    if num_of_frames == 1 {
        panic!("Only a single image file was given as an input. This is not enough to make an animation.");
    }

    let frame_size = width * height * 4;
    if num_of_frames != frames.len() / frame_size as usize {
        panic!("Expected total of frames do not match the number of frames provided. Are all frames the same height and width?");
    }

    let (collector, writer) = gifski_lite::new(settings).unwrap_throw();

    for (index, frame) in frames.chunks_exact(frame_size as usize).enumerate() {
        let image = ImgVec::new(frame.as_rgba().into(), width as usize, height as usize);
        collector.add_frame_rgba(index, image, index as f64 / fps as f64).unwrap_throw();
    }

    drop(collector);

    match writer.write(&mut buffer, &mut progress::NoProgress {}) {
        Ok(_) => (),
        Err(error) => panic!("Problem writing the gif: {:?}", error),
    }

    return buffer.into_inner();
}
