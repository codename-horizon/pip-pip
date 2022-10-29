use std::{path::Path, fs::write};

use image::{self, GenericImageView};

use crate::{GameMap, MapPNG, OUTPUT_DIR};

pub fn process_game_maps(map_pngs: &Vec<MapPNG>) {
    crossbeam::scope(|s| {
        for map_png in map_pngs {
            s.spawn(|_| {
                let name = map_png.path.file_name();
                let name = name.to_str().unwrap();
                println!("[RUST] start: {}", name);
                process_game_map(map_png);
                println!("[RUST] done: {}", name);
            });
        }
        Some(())
    }).unwrap(); 

    // threaded optimized: 38ms
    // threaded unoptimized: 670ms

    // 729ms
    // for map_png in map_pngs {
    //     process_game_map(map_png);
    // }
}

pub fn process_game_map(map_png: &MapPNG) {
    let path = map_png.path.path();
    let path = match path.to_str() {
        Some(p) => p,
        None => {
            println!("Skipping a path...");
            return;
        }
    };

    let img = match image::open(path) {
        Ok(img) => img,
        Err(_) => {
            print!("Could not open image {}", path);
            return;
        }
    };

    let mut game_map = GameMap {
        wall_tiles: Vec::new(),
        spawn_tiles: Vec::new(),
        wall_segments: Vec::new(),
        wall_segment_tiles: Vec::new(),
    };

    for (x, y, rgba) in img.pixels() {
        let [r, g, b, a] = rgba.0;
        if a != 255 {
            continue;
        }

        // wall tiles
        if r + g + b == 0 {
            game_map.wall_tiles.push([x as i64, y as i64]);
        }

        // spawn tiles
        if r == 255 && g + b == 0 {
            game_map.spawn_tiles.push([x as i64, y as i64]);
        }
    }

    game_map.center_tiles();
    game_map.generate_segments();

    save_game_map(map_png, &game_map);
}

fn save_game_map(map_png: &MapPNG,game_map: &GameMap) {
    // save game_map
    let j = serde_json::to_string(&game_map)
        .expect("Could not convert to json");

    let file_name = map_png.path.file_name();
    let file_name = file_name.to_str().unwrap();
    let file_name = Path::new(file_name).file_stem().unwrap().to_str().unwrap();
    let file_name = format!("{}.rust.map.json", file_name);

    let path = Path::new(OUTPUT_DIR).join(file_name);
    let path = path.to_str().unwrap();

    write(path, j).expect("Could not write JSON to file.");
}
