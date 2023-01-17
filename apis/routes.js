var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');
const connection = require('../config/config');

var multer = require('multer');
const { json } = require('express');
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/')
    },
    filename: function (req, file, cb) {
        let newName = Date.now() + '-' + file.originalname;
        cb(null, newName)
    }
})
var upload = multer({ storage: storage });

router.post("/API/userADD", upload.single('profilepic'), (req, resp) => {
    let user = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        password: req.body.password = bcrypt.hashSync(req.body.password, 10),
        cell: req.body.cell,
        gender: req.body.gender,
        createddate: req.body.createddate,
        qualification: req.body.qualification,
        usertype: req.body.usertype,
        profilepic: req.file.filename,
        status: req.body.status,
    }
    let sql1 = 'INsert INTO users SET ?';
    connection.query(sql1, user, (error, result, fields) => {

        if (error) throw error;
        if (error) {
            resp.send("failed to insert id an other table");
        }
        else {
            if (result.length > 0) {
                resp.send(result[0]);
            }
        }

        console.log('user data', user);
        let ulocation = {
            houseno: req.body.houseno,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            userID: result.insertId
        };
        console.log('user location', ulocation);
        let sql2 = 'INsert INTO userslocation SET ?';
        connection.query(sql2, ulocation, (error, result, fields) => {
            if (error) {
                resp.send("failed to insert ulocation userlocation table");
            } else {
                resp.send(result);
            }
        })
    })
});

router.post('/API/userLogin', async (req, resp, next) => {
    var email = req.body.email;
    var password = req.body.password;
    connection.query('SELECT * FROM users as u INNER JOIN userslocation as ul on u.ID = ul.userID WHERE  u.email = ?', [email], async function (error, results, fields) {
        if (error) error;
        else {
            if (results.length > 0) {
                const comparision = await bcrypt.compare(password, results[0].password);
                if (comparision) {
                    //resp.status(200).json(results[0]);
                    resp.status(200).send([{ message: 'successfully logined' }, results[0]]);
                    resp.end();
                }
                else if (resp.status(400)) {
                    resp.send([{ err: 'Incorrect email and/or Password!' }]);
                    resp.end();
                }
            }
            else {
                resp.status(401).send([{ err: 'Invalid email or password.' }]);
                resp.end();
            }
        }
    });
})

router.get("/API/userFetch", (req, resp) => {
    connection.query("SELECT * FROM users INNER JOIN userslocation ON users.ID = userslocation.userID", (err, result) => {
        if (err) {
            console.log('result not found');
        }
        else {
            var location = [];
            for (let i = 0; i < result.length; i++) {
                let locationOBJ = {
                    "ID": result[i].ID,
                    "name": result[i].name,
                    "email": result[i].email,
                    "password": result[i].password,
                    "cell": result[i].cell,
                    "gender": result[i].gender,
                    "createddate": result[i].createddate,
                    "qualification": result[i].qualification.split(","),
                    "usertype": result[i].usertype,
                    "profilepic": result[i].profilepic,
                    "status": result[i].status,
                    "objLocation": {
                        "ID": result[i].LID,
                        "houseno": result[i].houseno,
                        "city": result[i].city,
                        "state": result[i].state,
                        "country": result[i].country,
                        "userID": result[i].userID,
                    }
                }
                location[location.length] = locationOBJ;
            }
            resp.send(location);
        }
    })
});

router.put("/API/userUpdate", (req, resp) => {
    connection.query(`UPDATE users u , userslocation ul SET 
    u.name = '${req.body.name}',
    u.email = '${req.body.email}',
    u.cell = '${req.body.cell}',
    u.gender = '${req.body.gender}',
    u.createddate = '${req.body.createddate}',
    u.qualification = '${req.body.qualification}',
    u.usertype = '${req.body.usertype}',
    u.profilepic = '${req.body.profilepic}',
    u.status = '${req.body.status}',
    ul.houseno = '${req.body.houseno}',
    ul.city = '${req.body.city}',
    ul.state = '${req.body.state}',
    ul.country = '${req.body.country}'
    WHERE u.ID = ul.userID AND u.ID = ${req.body.ID}`, (err, result) => {
        // if (err) throw err;
        if (err) {
            resp.status(400).send({
                message: "error ocurred",
            });
        } else {
            resp.status(200).send({
                message: "user update sucessfully",
                user: req.body
            });
        }
    });
})

router.put("/API/resetPassword", (req, resp) => {
    var updateQuery = `UPDATE users SET  password = '${newPassword = bcrypt.hashSync(req.body.newPassword, 10)}' where ID = ${req.body.ID}`;
    connection.query(updateQuery, (error, result, fields) => {
        //if (error) throw error;
        if (error) {
            resp.status(401).send([{ message: 'password not updated' }, error]);
        }
        else {
            resp.status(200).send([{ message: 'password update successfully' }, result]);
        }
    })
})

























// router.route('/API/userADD').post(controller.userADD);

// router.route('/API/userADD', upload.single('profilepic')).post(controller.userADD);


module.exports = router;



