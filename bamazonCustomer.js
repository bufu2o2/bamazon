const mysql = require("mysql");
const i = require("inquirer");
const ch = require("chalk");
const cl = (m)=> {console.log(m);}
const ct = (t) => {console.table(t);}
const thrw = (e) => {if(e) throw e;}
const br = "\n\n";
const hr = "=====================================================================================================";
const PORT = 3306;
const USER = "root";
const PW = "123456789";
const DB = "bamazon";
const con = mysql.createConnection({
        host: "localhost",
        user: USER,
        password: PW,
        port: PORT,
        database: DB,
    });


//=================================================================== customer object ===================================================================\\
let customer = {
    list: (x) => {
        let p = "SELECT " + x + " FROM products";
        con.query(p, (e, r, f) => {
            thrw(e);
            cl(br + ch.greenBright(hr + "   The products for sale   " + hr) + br);
            ct(r);
            cl(br);
        });
    },
    buy: {
        stock: 0,
        byId: (itemid) => {
            let sq = "SELECT stock_quantity FROM products WHERE item_id = " + itemid;
            con.query(sq, (e,r,f) => {
                thrw(e);
                customer.buy.stock = r[0].stock_quantity;
                // cl(ch.magentaBright(customer.buy.stock));
            });
        },
        amt: (id, quant) => {
            customer.buy.byId(id);
            setTimeout(() => {
                let stock = customer.buy.stock;
                // cl(stock);
                // cl(quant);
                if(stock < quant){
                    return cl(ch.redBright.bold("Sorry!! there are only " + stock + " left of your item and you are trying to purchase " + quant + ". Please lower your quantity in order to complete transaction Thank you!" + br + "Kindly\nBamazon Management"));
                }
                else{
                    let newAmt = stock-quant;
                    // cl(newAmt);
                    let update = "UPDATE bamazon.products SET stock_quantity = " + newAmt + " WHERE item_id = " + id;
                    con.query(update, (e,r,f) => {
                        thrw(e);
                        cl(ch.greenBright(br + "You've successfully purchased your item from Bamazon and it should be at your door in 1 Hour!!\n Come back soon!" + br + hr));
                        // product.list("*");
                    });
                }
            }, 2000);
        }
    },
    run: () => {
        customer.list("*");
        setTimeout(() => {
            i.prompt([
                {
                    name: "buy",
                    message: "What is the ID of the Item you'd like to buy?",
                    type: "input",
                },
                {
                    name: "quant",
                    message: "How many would you like to buy?",
                    type: "input",
                }
            ]).then((r) => {
                if(r.quant <= 0){
                    cl(ch.redBright.bold("Please only select quantities above 0" + br + "Kindly\nBamazon Management"));
                    con.end();
                }
                else{
                    customer.buy.amt(r.buy, r.quant);
                    setTimeout(() => {
                        con.end();
                    }, 2000);
                }
            });
        }, 1000);
        
    },
}
    
        
//=================================================================== manager object ===================================================================\\
let manager = {
    auth: () => {
        i.prompt([
            {
                name: "user",
                message: "Username: ",
                type: "input",
            },
            {
                name: "pw",
                message: "Password",
                type: "password",
                mask: "",
            },
        ]).then((r) => {
            let un = r.user;
            let pw = r.pw;
            let check = "SELECT * FROM bamazon.auth WHERE username = ?";
            let realpw;
            con.query(check, [un], (e,r,f) => {
                thrw(e);
                realpw = r[0].pw;
                if(realpw === pw){
                    manager.main();
                }
                else{
                    cl(ch.redBright.bold(br + hr + br + "Incorrect Pw" + br + hr + br));
                    con.end();
                }
            });
        });
    },
    main: () => {
        cl(ch.greenBright.bold(br + hr + br + br + "Welcome to the Manager Section of Bamazon" + br));
        i.prompt([
            {
                name: "sel",
                message: "What would you like to do?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
                type: "list",
            },
        ]).then((r) => {
            let sel = r.sel;
            switch (sel) {
                case "View Products for Sale":
                    customer.list("*");
                    setTimeout(() => {
                    manager.main();
                }, 1000);
                    break;
                case "View Low Inventory":
                    manager.low(10);
                    setTimeout(() => {
                    manager.main();
                }, 1000);
                case "Add to Inventory":
                    manager.add.inventory();
                    // setTimeout(() => {
                    //     manager.main();
                    // }, 1000);
                    break;
                case "Add New Product":
                    manager.add.product();
                    // setTimeout(() => {
                    //     manager.main();
                    // }, 1000);
                    break;
                case "Exit":
                cl(ch.yellowBright(br + "See you later!" + br + hr + br));
                    con.end();
            }
        });
    },
    low: (x) => {
        let q = "SELECT * FROM bamazon.products WHERE stock_quantity < ?";
        con.query(q,[x], (e,r,f) => {
            thrw(e);
            cl(ch.cyanBright(br + "All Items with a stock lower than " + x));
            ct(r);
            cl(br);
        });
    },
    add: {
        inventory: () => {
            customer.list("*");
            setTimeout(() => {
                cl(ch.magentaBright(br + "Please add your new inventory"));
                i.prompt([
                    {
                        name: "id",
                        message: "ID of the Item: ",
                        type: "input",
                    },
                    {
                        name: "amt",
                        message: "Amount of inventory you'd like to add: ",
                        type: "input",
                    },
                ]).then((r) => {
                    let id = parseInt(r.id);
                    let amt = parseInt(r.amt);
                    customer.buy.byId(id);
                    setTimeout(() => {
                        let stock = customer.buy.stock;
                            let newAmt = stock + amt;
                            let update = "UPDATE bamazon.products SET stock_quantity = ? WHERE item_id = ?";
                            con.query(update, [newAmt, id], (e,r,f) => {
                                thrw(e);
                                // customer.list("*");
                                cl(ch.greenBright(br + "You've successfully added your inventory" + br + hr));
                                setTimeout(() => {
                                    manager.main();
                                }, 1000);
                            });
                    }, 1000);


                });
            }, 1000);

        },
        product: () => {
            cl(ch.magentaBright(br + "Please add your new product"));
            i.prompt([
                {
                    name: "name",
                    message: "Product Name: ",
                    type: "input",
                },
                {
                    name: "dept",
                    message: "Product Department: ",
                    type: "input",
                },
                {
                    name: "price",
                    message: "Product Price: ",
                    type: "input",
                },
                {
                    name: "stock",
                    message: "Amount of Product in stock: ",
                    type: "input",
                },
            ]).then((r) => {
                let name = r.name;
                let dept = r.dept;
                let price = r.price;
                let stock = r.stock;
                let q = "INSERT INTO bamazon.products (product_name, department_name, sale_price, stock_quantity) VALUES (?,?,?,?)";
                con.query(q, [name, dept, price, stock], (e,r,f) => {
                    thrw(e);
                    setTimeout(() => {
                        manager.main();
                    }, 1000);
                });
            });
        },
    }
}



//=================================================================== Run Program ===================================================================\\
con.connect((e) => {
    thrw(e);
    i.prompt([
        {
            name: "who",
            message: "Which department are you?",
            choices: ["Customer", "Manager", "Supervisor"],
            type: "list",
        }
    ]).then((r) => {
        switch (r.who) {
            case "Customer":
                customer.run();
                break;

            case "Manager":
                manager.auth();
                break;
        
            default:
                break;
        }
    });
    



})
