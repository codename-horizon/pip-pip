use serde::{Deserialize, Serialize};
use std::fs::DirEntry;

pub struct MapPNG {
    pub path: DirEntry,
}

pub type GameMapTile = Vec<[i64; 2]>;
pub type GameMapSegment = Vec<[i64; 4]>;

#[derive(Debug)]
pub struct GameMapBounds {
    max_x: i64,
    min_x: i64,
    max_y: i64,
    min_y: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GameMap {
    wall_tiles: GameMapTile,
    spawn_tiles: GameMapTile,
    wall_segments: GameMapSegment,
    wall_segment_tiles: GameMapTile,
}

impl GameMap {
    fn log(&self) {
        println!("{:?}", self.get_bounds())
    }

    fn borrow_tiles(&self) -> GameMapTile {
        let mut pool: GameMapTile = Vec::new();
        pool.extend(&self.wall_tiles);
        pool.extend(&self.spawn_tiles);
        pool
    }

    fn get_bounds(&self) -> GameMapBounds {
        let mut min_x = i64::MAX;
        let mut min_y = i64::MAX;
        let mut max_x = i64::MIN;
        let mut max_y = i64::MIN;

        let pool = self.borrow_tiles();

        for [x, y] in pool {
            if x > max_x {
                max_x = x
            }
            if x < min_x {
                min_x = x
            }
            if y > max_y {
                max_y = y
            }
            if y < min_y {
                min_y = y
            }
        }

        GameMapBounds {
            max_x,
            min_x,
            max_y,
            min_y,
        }
    }

    fn center_tiles(&mut self) {
        let bounds = self.get_bounds();
        let ave_x = (bounds.min_x + bounds.max_x) / 2;
        let ave_y = (bounds.min_y + bounds.max_y) / 2;

        let center = |pool: &mut GameMapTile| {
            for [x, y] in pool {
                *x -= ave_x;
                *y -= ave_y;
            }
        };

        center(&mut self.wall_tiles);
        center(&mut self.spawn_tiles);
        
    }
}

mod fs;
pub use fs::*;

mod process;
pub use process::*;
