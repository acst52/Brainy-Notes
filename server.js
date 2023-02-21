// first lets import the modules we will be using:
const express = require("express");
const path = require("path");
const fs = require("fs");
// const util = require('util');

// Helper method for generating unique ids
    // npm i uuid@3.4.0 instead!
const uuid = require('uuid/v1');

// Heroku will create env
const PORT = process.env.PORT || 3001;

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
    // Use sendFile method: when working w/ static files, want to give absolute path. Use path module (imported at top) join method which joins 2 strings to form a path / route. console.log __dirname --> gives us path to directory we are working on. then we can join it to the relative path = currentDir/fileName.  
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

app.delete("/api/notes/:id", (req, res) =>{
  let id = req.params.id;
  fs.readFile("./db/db.json", "utf-8", (err, data) => {
    if (err) {
      console.log(err);
    } 
    let noteData = JSON.parse(data);
    // filter thru array of note data (above), filter gives new array based on predicate fcn: keeps note in array if it meets condition: id = must match req.params id --> new array has all notes except one we want to delete
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

// wildcard route in case someone goes to a bad path --> index.html
  app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, './public/index.html'))
);

  
app.listen(PORT, () =>
    console.log(`App listening on port: ${PORT}`)
);



// ***** HEROKU *****
// Heroku helps us host our APIs
// we can take our code base, push to GitHub, then connect Heroku to GitHub so that latest commit is deployed to our project.
// heroku has its own CLI .. cant host node.js on github pages b/c not yet supported
// heroku --version should tell you version if its installed properly
  // for auth run: heroku auth:login
  // to run page: npm start 
  // then can do git add, it commit -m "initial commit" ETC
  // to create heroku page, type: heroku create
  // then do git remote -v
      // to add a remote to local repo, do: heroku git:remote
    // gens random name for URL
    // then check to see if git has remote pulls: git remote -v
    // now instead of git push origin main, we do git push heroku main (to push everything to our heroku acct)
    // heroku open (deploys page @ the herokuappdeployment URL)
  // heroku logs --tail
// npm install -g heroku. heroku --version. heroku auth:login. heroku create (creates link). git push heroku main. heroku open (opens deployed app from CLI)
  // make sure git is initialized. heroku auth:login. heroku create (creates link). git push heroku main. heroku open (opens deployed app from CLI)
  // config vars in heroku, can add API keys. in our code if we have process.env.APIKEY --> heroku will find it in config vars


  // git push heroku main
  // should be adding 2 more remove -v links 