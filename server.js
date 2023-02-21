// first lets import the modules we will be using:
const express = require("express");
const path = require("path");
const fs = require("fs");

// Helper method for generating unique ids
const uuid = require('uuid/v1'); // OR [npm i uuid@3.4.0] instead!

const PORT = process.env.PORT || 3001; // Heroku will create .env

// call the express method, assign to var "app":
const app = express();

// to serve static pages, use middleware: fcn that takes argument that calls next fcn:
    // Middleware for parsing application/json and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET Route for homepage
app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, './public/notes.html'))
);

// normally, we use JSON method to create classic API obj output:
    // where will the notes be stored? in the database JSON file. 
    // Use sendFile method: when working w/ static files, want to give absolute path

// GET route for notes page:
app.get('/api/notes', (req, res) => {
  fs.readFile("./db/db.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(JSON.parse(data));
    }
  })
})

// POST Route for new notes
app.post('/api/notes', (req, res) => {
    console.log(`${req.method} request received to add notes`);
  
    const { title, text } = req.body;
  
    if (title && text) {
      const newNote = {
        title,
        text,
        id: uuid(),
      };
  
      fs.readFile("./db/db.json", "utf-8", (err, data) => {
        if (err) {
          console.log(err);
        } else {
          const dbNotes = JSON.parse(data);
          dbNotes.push(newNote);
          // null = replacer; something in index.js specifies not to add if not sep by spaces...
          fs.writeFile("./db/db.json", JSON.stringify(dbNotes, null, 4), (writeErr) => {
            writeErr ? console.error(writeErr) : console.info("Notes added successfully!")
          })
        }
      })
      const response = {
        body: newNote
      }
      console.log(response);
      res.json(response);

    } else {
      res.json('Error in adding notes');
    }
  });

// DELETE route for deleting notes
app.delete("/api/notes/:id", (req, res) =>{
  let id = req.params.id;
  fs.readFile("./db/db.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } 
    let noteData = JSON.parse(data);
    // now lets filter thru array of note data (above); filter gives new array based on predicate fcn: 
      // removes note in array if meets condition: id must match req.params id --> new array has all notes except deleted
    let filteredNotes = noteData.filter((note) => note.id !== id);
    fs.writeFile("./db/db.json", JSON.stringify(filteredNotes), (writeErr) => {
      if (writeErr) {
        console.log(writeErr);
      } else {
        console.log("Note has been deleted");
      }
    })
})
  res.end();
})

// wildcard route (in case someone goes to a bad path) --> index.html
  app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, './public/index.html'))
);

  
app.listen(PORT, () =>
    console.log(`App listening on port: ${PORT}`)
);


// DEPLOYING FINISHED GITHUB PROJECT ON HEROKU - STEPS:
    // 1. make sure all your files are in main. Move contents of develop dir into main if needed.
          // Similarly to how GitHub needs an index file in main, Heroku needs server.js in main to deploy!
    // 2. make sure all dependencies installed (incl [npm i -g heroku] if not yet done; 
          // [heroku --version] should show version after you install).
    // 3. make sure working tree clean: [git add .] / [git commit -m "msg"] / [git push origin main]
    // 4. [heroku auth:login]
    // 5. [heroku create]
    // 6. [git remote -v] --> SHOULD SEE 4 LINKS (fetch & push for origin and heroku)
    // 7. [git push heroku main]
    // 8. [heroku open] --> deploys your project @ random link generated w/ heroku create!
    // 9. IF YOU MAKE CHANGES YOU WANT DEPLOYED: do steps 3, 4, 7
