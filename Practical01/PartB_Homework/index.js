const express = require("express");
const app = express();
const PORT = 3000;

// Root Route 
app.get("/", (req, res) => {
    res.send("Welcome to the Homework API" );
});

// My Short Intro 
app.get("/intro", (req,res) => {
    res.send("I'm a year 2 ICT student at Ngee ann poly and I am passionate about back-end development. I Hope to learn more from my teacher Mr Tan")
})

// My Name
app.get("/name", (req,res) => {
    res.send("My name is Leslie He Jingting ");
})

// My Hobbies
app.get("/hobbies", (req, res) => {
  res.json(["gaming", "listening to music", "watching shows"]);
});

// My favourite food
app.get("/food", (req,res) => {
    res.send("My favourite food is chicken rice, pasta and egg fried rice");
})

app.get("/student", (req, res) => {
  res.json({
    name: "Leslie He JingTing",
    hobbies: ["gaming", "listening to music", "watching shows"],
    intro: "Hi, I'm Leslie, a Year 2 student at Ngee Ann Polytechnic!"
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
