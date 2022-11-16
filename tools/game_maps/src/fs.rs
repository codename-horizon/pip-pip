use std::fs::{self};

use crate::{MapPNG, MAP_DIR};


pub fn get_map_pngs() -> Option<Vec<MapPNG>> {
    let mut pngs: Vec<MapPNG> = Vec::new();

    let paths = fs::read_dir(MAP_DIR).expect("Could not open map directory.");

    for result in paths {
        let path = result.expect("Could not get path.");
        let file_name = path.file_name();
        let file_name = file_name.to_str()?;

        if file_name.to_lowercase().as_str().ends_with(".png") {
            pngs.push(MapPNG { path })
        }
    }

    Some(pngs)
}
