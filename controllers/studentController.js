import Student from "../models/student.js";


export function getstudent(req, res)
{
  console.log('HTTP get Request received at /');
  Student.find({},'name email -_id').then((students) => 
    {
      res.json(students);
    }
  ).catch((err) => 
    {
      console.log('Error fetching students: ', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  );

}

export function createStudent(req, res)
{
    console.log('HTTP get Request received at /user');

    if (req.user == null) {
      return res.status(401).json({ error: 'Please Login to perfome this action' });
    }
    if(req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    console.log(req.body);
      const student = new Student({
        name: req.body.name,
        age: req.body.age,
        email: req.body.email
      }); 

      student.save().then(() => 
        {
          console.log('Student saved successfully');
          res.json(
            { 
              message: 'Hello this is a post /user request!'
            })
        }).catch((err) => 
        {
          console.log('Error saving student: ', err);
        })
    }