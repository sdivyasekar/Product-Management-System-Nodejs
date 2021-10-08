
const express = require('express');
const app = express();
const mysql = require('mysql');
var bodyParser = require('body-parser');
const { request } = require('express');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: "true" }));
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Root@123",
    database: "product"

});
app.get('/Available_products', function (req, res) {
    con.query("select * from Product_list", function (err, db_res1) {
        if (err) throw err;
        res.send(db_res1);
        console.log("Done");
    });
});
app.post("/customer", async function (req, res) {
    let product_array = req.body.product;
    var finalData = [];
    for (let product of product_array) {
        var fieldData = new Promise(function (resolve, reject) {
            con.query('Select prod_quantity from Product_list where prod_itemsID=' + product.prod_itemsID + '', function (err, row, field) {
                console.log(row[0].prod_quantity);
                if (row[0].prod_quantity < product.prod_quantity) {

                    reject("Out of Stock=" + product.prod_name);

                }
                else resolve('product available=' + product.prod_name);
            });
        });

        fieldData.then(function (result) {
            finalData.push(result);
            console.log(result);
            if (result) {
                let field1 = new Promise((resolve, reject) => {
                    con.query("insert into Byer_List(Transaction_id,Customer_name,prod_itemsID,prod_name,prod_quantity) values('" + req.body.Transaction_ID + "','" + req.body.Customer_name + "','" + product.prod_itemsID + "','" + product.prod_name + "','" + product.prod_quantity + "')", function (err, row, field) {
                        if (err) reject(err);
                        else {

                            con.query('update Product_list set prod_quantity=prod_quantity- ' + product.prod_quantity + ',updated_at=Now() where prod_itemsID=' + product.prod_itemsID + '', function (err, row, field) {
                                if (err) reject(err);
                                else {
                                    resolve(row);
                                }

                            });
                        }
                    });
                });

                field1.then(res => {
                    console.log(res);
                }).catch(err => {
                    console.log(err);
                })

            }
            if (finalData.length == product_array.length) {
                res.send(finalData);
                console.log(finalData);
            }

        }).catch(function (error) {

            finalData.push(error);
            if (finalData.length == product_array.length) {
                res.send(finalData);
                console.log(finalData);
            }

        }
        );
    }
});


app.listen(8080);
console.log("Running");


