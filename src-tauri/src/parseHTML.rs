use std::fs;
use std::fs::File;
use std::io::Write;
use soup::prelude::*;
use serde::{Serialize, Deserialize};
use chrono::Utc;
// use base64;

#[derive(Debug, Serialize, Deserialize)]
struct CompactTimetable {
    u: String,  // username
    r: String,  // registration number
    s: i32,     // semester
    t: String,  // timestamp
    o: Vec<CompactSlot>, // occupied slots
}

#[derive(Debug, Serialize, Deserialize)]
struct CompactSlot {
    d: u8,       // day (1-7)
    s: String,   // slot_type (t/l)
    p: u8,       // period
    f: String,   // full_text (original cell text)
}

#[tauri::command]
pub fn parseHTML(html_content: String) -> Result<String, String> {
    // Step 1: Create soup from provided HTML content
    let soup = Soup::new(&html_content);

    // Extract registration number from the navbar
    let mut registration_number = "Unknown".to_string();
    if let Some(span) = soup.tag("span")
        .class("navbar-text")
        .class("text-light")
        .class("small")
        .class("fw-bold")
        .find() {
            let text = span.text();
            if let Some(index) = text.find(" (") {
                registration_number = text[..index].trim().to_string();
            } else {
                registration_number = text.trim().to_string();
            }
    }

    // Step 2: Find the table by ID
    let table = soup.tag("table")
        .attr("id", "timeTableStyle")
        .find()
        .ok_or("No table with id 'timeTableStyle' found")?;

    // Step 3: Find all rows to extract class data
    let rows: Vec<_> = table.tag("tr").find_all().collect();
    
    // Step 4: Extract green cell data
    let mut occupied_slots: Vec<CompactSlot> = Vec::new();
    
    // Process day rows (starting from row 4, in pairs of 2 - theory and lab)
    for day_idx in 0..7 { // Monday to Sunday
        let theory_row_idx = 4 + (day_idx * 2);
        let lab_row_idx = 5 + (day_idx * 2);
        
        if theory_row_idx < rows.len() && lab_row_idx < rows.len() {
            let day_num = day_idx as u8 + 1; // 1=Monday, 2=Tuesday, etc.
            
            // Process theory row
            let theory_cells: Vec<_> = rows[theory_row_idx].tag("td").find_all().collect();
            if theory_cells.len() >= 2 {
                // Skip day name cell, process remaining cells
                for (col_idx, cell) in theory_cells.iter().skip(1).enumerate() {
                    // Skip lunch columns (6 and 7 are lunch breaks)
                    if col_idx == 6 || col_idx == 7 {
                        continue;
                    }
                    
                    // Check for green background
                    let has_green_bg = cell.get("bgcolor").map_or(false, |bg| bg == "#CCFF33");
                    
                    if has_green_bg {
                        let cell_text = cell.text().trim().to_string();
                        if !cell_text.is_empty() && cell_text != "-" {
                            // Map table column to actual period number
                            let period = if col_idx < 6 {
                                col_idx as u8 + 1  // Columns 0-5 → Periods 1-6
                            } else {
                                col_idx as u8 - 1  // Columns 8-13 → Periods 7-12
                            };
                            
                            occupied_slots.push(CompactSlot {
                                d: day_num,
                                s: "t".to_string(), // theory
                                p: period,
                                f: cell_text,
                            });
                        }
                    }
                }
            }
            
            // Process lab row
            let lab_cells: Vec<_> = rows[lab_row_idx].tag("td").find_all().collect();
            if lab_cells.len() >= 2 {
                // Skip day name cell, process remaining cells
                for (col_idx, cell) in lab_cells.iter().skip(1).enumerate() {
                    // Skip lunch columns (6 and 7 are lunch breaks)
                    if col_idx == 6 || col_idx == 7 {
                        continue;
                    }
                    
                    // Check for green background
                    let has_green_bg = cell.get("bgcolor").map_or(false, |bg| bg == "#CCFF33");
                    
                    if has_green_bg {
                        let cell_text = cell.text().trim().to_string();
                        if !cell_text.is_empty() && cell_text != "-" {
                            // Map table column to actual period number
                            let period = if col_idx < 6 {
                                col_idx as u8 + 1  // Columns 0-5 → Periods 1-6
                            } else {
                                col_idx as u8 - 1  // Columns 8-13 → Periods 7-12
                            };
                            
                            occupied_slots.push(CompactSlot {
                                d: day_num,
                                s: "l".to_string(), // lab
                                p: period,
                                f: cell_text,
                            });
                        }
                    }
                }
            }
        }
    }
    
    // Step 5: Create compact timetable
    let timetable = CompactTimetable {
        u: "ppmpreetham".to_string(),
        r: registration_number,
        s: 0,
        t: "2025-06-15T11:34:53+00:00".to_string(),
        o: occupied_slots,
    };
    
    // Step 6: Convert to JSON and return
    let json = serde_json::to_string(&timetable)
        .map_err(|e| format!("Failed to serialize JSON: {}", e))?;
    
    Ok(json)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Step 1: Load HTML file
    let html = fs::read_to_string("VIT Chennai - VTOP.html")?;

    // Step 2: Parse HTML and get JSON
    let json_result = parseHTML(html)?;
    
    // Step 3: Print the result
    println!("Generated compact JSON:");
    println!("{}", json_result);
    
    // Step 4: Save JSON to file
    std::fs::write("timetable_minimal.json", &json_result)?;
    println!("Minimal timetable JSON saved to timetable_minimal.json");
    
    Ok(())
}