fetch("http://localhost:8082/api/exams/exams", {
  method: "GET",
  headers: {
    Origin: "http://localhost:4200"
  }
})
  .then(r => {
    let output = "Status: " + r.status + "\n";
    r.headers.forEach((v, k) => {
      output += k + ": " + v + "\n";
    });
    const fs = require("fs");
    fs.writeFileSync("out2.txt", output);
  })
  .catch(e => require("fs").writeFileSync("out2.txt", e.toString()));
