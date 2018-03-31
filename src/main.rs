#[macro_use]
extern crate serde_derive;
extern crate serde;
extern crate toml;
extern crate git2;
extern crate colored;

mod package;

use colored::*;
use git2::Repository;

fn main() {
    let path_to_toml = "test/test-package.toml";
    let pkg = package::from_file(path_to_toml);

    match pkg {
        Ok(pkg) => println!("{}", pkg),
        Err(err) => println!("Error reading {}:\n  {}", &path_to_toml.red(), err),
    };
}
