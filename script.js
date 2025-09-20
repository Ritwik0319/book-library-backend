const { log } = require("console");
const express = require("express");
const fs = require("fs").promises;
const uuid = require("uuid").v4;
const app = express();
app.use(express.json());
app.use(express.urlencoded());
console.log(uuid());

//1.defalut
app.get("/", (req, res) => res.send("server running healthy"));

//2.get all employees
app.get("/getAllEmployee", async (req, res) => {
  try {
    const data = await fs.readFile("./data/employees.json", "utf-8");
    console.log(data);
    res.status(200).send(data);
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error");
  }
});

//3.get employee by id
app.get("/getEmployee/:id", async (req, res) => {
  // console.log(req.params);
  try {
    const data = await fs.readFile("./data/employees.json", "utf-8");
    const emp = JSON.parse(data).filter((emp) => {
      // console.log(emp.emp_id == req.params.id);
      return emp.emp_id == req.params.id;
    });
    if (emp.length > 0) {
      res.status(200).send(emp);
    } else {
      res.send("no employee found");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("internal server error");
  }
});

// 4.post/create employee
app.post("/createEmp", async (req, res) => {
  const { emp_name, role, sal } = req.body;
  console.log(emp_name);

  try {
    const data = JSON.parse(
      await fs.readFile("./data/employees.json", "utf-8")
    );
    const user = {
      emp_id: uuid(),
      emp_name,
      role,
      sal,
    };
    data.push(user);
    console.log(user);
    console.log(data);

    await fs.writeFile("./data/employees.json", JSON.stringify(data));
    console.log(data);
    res.json({ message: "user created sucessfully", user });
  } catch (error) {
    res.send("internal server error");
  }
});

//5.modify update employee by id
app.patch("/updateEmployee/:id", async (req, res) => {
  const { id } = req.params;
  const { emp_id, emp_name, role, sal } = req.body;

  console.log(req.params);
  console.log(req.body);

  console.log(id);
  console.log(emp_id, emp_name, role, sal);

  try {
    const data = JSON.parse(await fs.readFile("./data/employees.json"));
    const updatedEmp = data.map((emp) => {
      if (emp.emp_id == req.params.id) {
        return {
          ...emp,
          emp_name: emp_name || emp.emp_name,
          role: role || emp.role,
          sal: sal || emp.sal,
        };
      }
      return emp;
    });
    console.log(data);
    console.log(updatedEmp);
    await fs.writeFile("./data/employees.json", JSON.stringify(updatedEmp));
    res.json({ message: "employee updates", user: req.body });
  } catch (error) {
    res.send("internal error");
  }
});

// 6.delete employee by id
app.delete("/deleteEmployee/:id", async (req, res) => {
  const { id } = req.params;
  const data = JSON.parse(await fs.readFile("./data/employees.json"));
  const some = data.some((emp) => emp.emp_id == id);
  console.log(some);
  if (some) {
    try {
      updatedData = data.filter((emp) => emp.emp_id != id);
      console.log(data);
      await fs.writeFile("./data/employees.json", JSON.stringify(updatedData));
      res.json({ message: "employee deleted", id });
    } catch (error) {
      res.send("internal server error");
    }
  } else {
    res.send("no employee found");
  }
});

//server is listening at poet 8080
app.listen(8080, () => console.log("server running at port 8080"));
