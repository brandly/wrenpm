use toml;

use colored::*;

use std::fmt;
use std::error;
use std::process;
use std::io;
use std::fs::File;
use std::io::prelude::*;

pub fn from_file(path: &str) -> Result<Package, ReadError> {
    let mut file = File::open(path).or_else(|e| Err(ReadError::Io(e)))?;

    let mut toml_raw = String::new();
    file.read_to_string(&mut toml_raw).or_else(|e| Err(ReadError::Io(e)))?;

    from_str(&toml_raw.to_owned())
}

pub fn from_str(toml_raw: &str) -> Result<Package, ReadError> {
    toml::from_str(toml_raw).or_else(|e| Err(ReadError::Parse(e)))
}

#[derive(Serialize, Deserialize, Debug)]
pub struct Package {
    pub name: String,
    dependencies: Vec<Dependency>,
}

impl fmt::Display for Package {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{}\n", self.name.magenta())?;

        for dep in &self.dependencies {
            write!(f, "{}", "| ".dimmed())?;
            write!(f, "{}\n", &dep)?;
        }

        Ok(())
    }
}

#[derive(Serialize, Deserialize, Debug)]
struct Dependency {
    name: String,
    git: String,
}

impl fmt::Display for Dependency {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        write!(f, "{} {}{}{}", self.name, &"(".dimmed(), &self.git.underline().dimmed(), &")".dimmed())
    }
}

#[derive(Debug)]
pub enum ReadError {
    Io(io::Error),
    Parse(toml::de::Error),
}

impl fmt::Display for ReadError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match *self {
            ReadError::Io(ref err) => write!(f, "IO error: {}", err),
            ReadError::Parse(ref err) => write!(f, "Parse error: {}", err),
        }
    }
}

impl error::Error for ReadError {
    fn description(&self) -> &str {
        // Both underlying errors already impl `Error`, so we'll use their
        // implementations rather than writing our own.
        match *self {
            ReadError::Io(ref err) => err.description(),
            ReadError::Parse(ref err) => err.description(),
        }
    }

    fn cause(&self) -> Option<&error::Error> {
        // Note: both of these implictly cast `err` to `&Error` because both
        // already implement `Error`.
        match *self {
            ReadError::Io(ref err) => Some(err),
            ReadError::Parse(ref err) => Some(err),
        }
    }
}
