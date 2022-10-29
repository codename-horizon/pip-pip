use game_maps::{get_map_pngs, process_game_maps};

fn main() {
    let pngs = get_map_pngs().expect("Could not get pngs.");

    process_game_maps(&pngs);
}
