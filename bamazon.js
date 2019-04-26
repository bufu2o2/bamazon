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
const kill = () => {
    return new Promise((res,rej) => {
        con.end();
        res(ch.redBright("Connection Cut"));
    });
}


//=================================================================== customer object ===================================================================\\
let customer = {
    list: (x) => {
        return new Promise ((res, rej) => {
            let p = "SELECT " + x + " FROM products";
            con.query(p, (e, r, f) => {
                thrw(e);
                cl(br + ch.greenBright(hr + "   The products for sale   " + hr) + br);
                ct(r);
                cl(br);
                res(r);
            });
        });
    },
    buy: {
        stock: 0,
        byId: (itemid) => {
            return new Promise((res, rej) => {
                let sq = "SELECT stock_quantity FROM products WHERE item_id = " + itemid;
                con.query(sq, (e,r,f) => {
                    thrw(e);
                    customer.buy.stock = r[0].stock_quantity;
                    // cl(ch.magentaBright(customer.buy.stock));
                    res(r[0].stock_quantity);
                });
            });
        },
        amt: async function(id, quant) {
            let stock = await customer.buy.byId(id);
            stock = parseInt(stock);
            if(stock < quant){
                return cl(ch.redBright.bold("Sorry!! there are only " + stock + " left of your item and you are trying to purchase " + quant + ". Please lower your quantity in order to complete transaction Thank you!" + br + "Kindly\nBamazon Management"));
            }
            else{
                let newAmt = stock-quant;
                let update = "UPDATE bamazon.products SET stock_quantity = " + newAmt + " WHERE item_id = " + id;
                con.query(update, (e,r,f) => {
                    thrw(e);
                    cl(ch.greenBright(br + "You've successfully purchased your item from Bamazon and it should be at your door in 1 Hour!!\n Come back soon!" + br + hr));
                    // product.list("*");
                });
//======================================================= INNER PROMISES ========================================================\\
                let grabInfo = (itemId) => {
                    return new Promise((res,rej) => {
                        let pisql = ("SELECT item_id, department_name, sale_price, stock_quantity, sales, revenue " +
                        "FROM bamazon.products AS prod "+
                        "JOIN bamazon.dept AS dept "+
                        "ON prod.department_name = dept.dept_name "+
                        "WHERE item_id = " + itemId);
                        //cl(pisql);
                        con.query(pisql, (e,r,f) => {
                            let r0 = r[0];
                            res({
                                id: r0.item_id,
                                dept: r0.department_name,
                                price: r0.sale_price,
                                stock: r0.stock_quantity,
                                sale: r0.sales,
                                profit: r0.revenue,
                            });
                        });
                    });
                }
                let updateProfit = (cp, p, q, dn) => {
                    return new Promise((res, rej) => {
                        let newpro = parseInt(cp) + (p * q);
                        let uprosql = "UPDATE bamazon.dept SET revenue = ? WHERE dept_name = ?";
                        con.query(uprosql, [newpro, dn], (e,r,f) => {
                            thrw(e);
                            res(ch.greenBright(br + "You've successfully updated the profits for " + dn + br + hr));
                        });
                    });
                }
                let updateSales = (s, q, dn) => {
                    return new Promise((res,rej) => {
                        let salesql = "UPDATE bamazon.dept SET sales = ? WHERE dept_name = ?";
                        let news = (parseInt(s) + q);
                        con.query(salesql, [news, dn], (e,r,f) => {
                            thrw(e);
                            res(ch.greenBright(br + "You've successfully updated the sales for " + dn + br + hr));
                        });
                    });
                }

                let info = await grabInfo(id);
                let uSales = await updateSales(info.sale, quant, info.dept);
                let uProfits = await updateProfit(info.profit, info.price, quant, info.dept);
            }
        }
    },
    run: async function() {
        let list = await customer.list("*");
        let r = await i.prompt([
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
            ]);
        if(parseInt(r.quant) <= 0){
            cl(ch.redBright.bold("Please only select quantities above 0" + br + "Kindly\nBamazon Management"));
        }
        else{
            let buyAmt = await customer.buy.amt(parseInt(r.buy), parseInt(r.quant));
        }        
        con.end();
    },
}
    
        
//=================================================================== manager object ===================================================================\\
let manager = {
    auth: () => {
        return new Promise((res,rej) => {
            let authRun = async () => {
                let r = await i.prompt([
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
                ]);
                let un = r.user;
                let pw = r.pw;
                let check = "SELECT * FROM bamazon.auth WHERE username = ?";
                let realpw;
                con.query(check, [un], (e,r,f) => {
                    thrw(e);
                    realpw = r[0].pw;
                    if(realpw === pw){
                        manager.main();
                        res(ch.cyanBright(br + hr + br + "Access Granted" + br));
                    }
                    else{
                        cl(ch.redBright.bold(br + hr + br + "Incorrect Pw" + br + hr + br));
                        con.end();
                    }
                });
            }
            authRun();
        }); 
    },
    // auth: () => {
    //     i.prompt([
    //         {
    //             name: "user",
    //             message: "Username: ",
    //             type: "input",
    //         },
    //         {
    //             name: "pw",
    //             message: "Password",
    //             type: "password",
    //             mask: "",
    //         },
    //     ]).then((r) => {
    //         let un = r.user;
    //         let pw = r.pw;
    //         let check = "SELECT * FROM bamazon.auth WHERE username = ?";
    //         let realpw;
    //         con.query(check, [un], (e,r,f) => {
    //             thrw(e);
    //             realpw = r[0].pw;
    //             if(realpw === pw){
    //                 manager.main();
    //             }
    //             else{
    //                 cl(ch.redBright.bold(br + hr + br + "Incorrect Pw" + br + hr + br));
    //                 con.end();
    //             }
    //         });
    //     });
    // },
    main: async function () {
        cl(ch.greenBright.bold(br + hr + br + br + "Welcome to the Manager Section of Bamazon" + br));
        let r = await i.prompt([
            {
                name: "sel",
                message: "What would you like to do?",
                choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"],
                type: "list",
            },
        ]);
        let sel = r.sel;
            switch (sel) {
                case "View Products for Sale":
                    let list = await customer.list("*");
                    manager.main();
                    break;
                case "View Low Inventory":
                    let lowI = await manager.low(10);
                    manager.main();
                    break;
                case "Add to Inventory":
                    let addI = await manager.add.inventory();
                    manager.main();
                    break;
                case "Add New Product":
                    manager.add.product();

                    break;
                case "Exit":
                cl(ch.yellowBright(br + "See you later!" + br + hr + br));
                con.end();
                break;
            }
    },
    low: (x) => {
        return new Promise((res,rej) => {
            let q = "SELECT * FROM bamazon.products WHERE stock_quantity < ?";
            con.query(q,[x], (e,r,f) => {
                thrw(e);
                cl(ch.cyanBright(br + "All Items with a stock lower than " + x));
                ct(r);
                cl(br);
                res(ch.greenBright(br + "This is all the low inventory" + br + hr));
            });
        });

    },
    add: {
        inventory: () => {
            return new Promise( async (res,rej) => {
                let list = await customer.list("*");
                    cl(ch.magentaBright(br + "Please add your new inventory"));
                let r = await i.prompt([
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
                    ]);
                let id = parseInt(r.id);
                let amt = parseInt(r.amt);
                let stock = await customer.buy.byId(id);
                let newAmt = stock + amt;
                let update = "UPDATE bamazon.products SET stock_quantity = ? WHERE item_id = ?";
                con.query(update, [newAmt, id], (e,r,f) => {
                    thrw(e);
                    // customer.list("*");
                    //manager.main(); 
                    res(ch.greenBright(br + "You've successfully added your inventory" + br + hr));
                });
            });
        },
        product: () => {
            return new Promise(async (res, rej) => {
                cl(ch.magentaBright(br + "Please add your new product"));
                let r = await i.prompt([
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
                ]);
                let name = r.name;
                let dept = r.dept;
                let price = r.price;
                let stock = r.stock;
                let q = "INSERT INTO bamazon.products (product_name, department_name, sale_price, stock_quantity) VALUES (?,?,?,?)";
                con.query(q, [name, dept, price, stock], (e,r,f) => {
                    thrw(e);
                    res(ch.greenBright(br + "You've successfully added your new product" + name + br + hr));
                });
            });
        },
    },
}

//=================================================================== Supervisor Object ===================================================================\\

let supervisor = {
    auth: () => {
        return new Promise((res,rej) => {
            let authRun = async () => {
                let r = await i.prompt([
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
                ]);
                let un = r.user;
                let pw = r.pw;
                let check = "SELECT * FROM bamazon.auth WHERE username = ?";
                let realpw;
                con.query(check, [un], (e,r,f) => {
                    thrw(e);
                    realpw = r[0].pw;
                    if(realpw === pw){
                        supervisor.run();
                        res(ch.cyanBright(br + hr + br + "Access Granted" + br));
                    }
                    else{
                        cl(ch.redBright.bold(br + hr + br + "Incorrect Pw" + br + hr + br));
                        con.end();
                    }
                });
            }
            authRun();
        }); 
    },
    view: () => {
        return new Promise((res,rej) => {
            let viewsql = "SELECT * FROM bamazon.dept";
            con.query(viewsql, (e,r,f) => {
                thrw(e);
                let pull = [];
                for(let i=0;i<r.length;i++) {
                    let ri = r[i];
                    pull[i] = {
                        id: ri.dept_id,
                        name: ri.dept_name,
                        overhead: ri.overhead,
                        sales: ri.sales,
                        profit: (parseInt(ri.revenue) - parseInt(ri.overhead)),
                    }
                }
                res(pull);
            });
        });
    },
    newDept: () => {
        return new Promise((res,rej) => {
            async function promptUser() {
                let r = await i.prompt([
                    {
                        name: "name",
                        message: "Department Name: ",
                        type: "input",
                    },
                    {
                        name: "overhead",
                        message: "Department Overhead: ",
                        type: "input",
                    },
                    {
                        name: "sales",
                        message: "Department Sales: ",
                        type: "input",
                    },
                    {
                        name: "revenue",
                        message: "Department Revenue: ",
                        type: "input",
                    },
                ]);
                let deptsql = "INSERT INTO bamazon.dept (dept_name, overhead, sales, revenue) VALUES (?,?,?,?)";
                con.query(deptsql, [r.name, r.overhead, r.sales, r.revenue], (e,r,f) => {
                    cl("start query");
                    thrw(e);
                    res(ch.greenBright(br + "You've successfully created your new Department" + br));
                });
            }
            promptUser();
        });
    },
    run: async function() {
        cl(ch.cyanBright.bold(br + hr + " Welcome to the Supervisor's Menu " + hr + br));
        let r = await i.prompt([
            {
                name: "sel",
                type: "list",
                message: "what would you like to do?",
                choices: ["View Product Sales Department", "Create a new Department", "Exit"],
            },
        ]);
        switch (r.sel) {
            case "View Product Sales Department":
                let tbl = await supervisor.view();
                ct(tbl);
                cl(br);
                supervisor.run();
                break;
            
            case "Create a new Department":
                let add = await supervisor.newDept();
                cl(br + add);
                supervisor.run();
                break;

            case "Exit":
            con.end();
            break;
        }
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
        
            case "Supervisor":
                supervisor.auth();
                break;
        }
    });
});



//=================================================================== R&D ===================================================================\\

function test(x){
    return new Promise((res, rej) => {
        let p = "SELECT " + x + " FROM products";
        con.query(p, (e, r, f) => {
            thrw(e);
                cl(br + ch.greenBright(hr + "   The products for sale   " + hr) + br);
                ct(r);
                cl(br);
            });
});
}

let deptName = (id) => {
    return new Promise((res, rej) => {
        let dnamesql = "SELECT department_name FROM bamazon.products WHERE item_id = " + id;
        con.query(dnamesql, (e,r,f) => {
            thrw(e);
            res(r[0].department_name);
        })
    });
}


let grabProfit = (d) => {
    return new Promise((res,rej) => {
        let cprofsql = "SELECT profit FROM bamazon.dept WHERE dept_name = ?";
        con.query(cprofsql, [d], (e,r,f) => {
            thrw(e);
            res(r[0].profit);
        });
    });
}


let pullInfo = (itemId) => {
    return new Promise((res,rej) => {
        let pisql = ("SELECT item_id, department_name, sale_price, stock_quantity, sales, profit " +
        "FROM bamazon.products AS prod "+
        "JOIN bamazon.dept AS dept "+
        "ON prod.department_name = dept.dept_name "+
        "WHERE item_id = " + itemId);
        //cl(pisql);
        con.query(pisql, (e,r,f) => {
            let r0 = r[0];
            res({
                id: r0.item_id,
                dept: r0.department_name,
                price: r0.sale_price,
                stock: r0.stock_quantity,
                sale: r0.sales,
                profit: r0.profit,
            });
        });
    });
}




function test1() {
    return new Promise((res, rej) => {
        cl("test1 function promise activated");
        res();
    });
}


// test().then((r) => {
//     cl(r);
// }).then(test1().then((r) => {
//     cl(r);
// }));


async function doWork() {
    let dname = await deptName(5);
    cl(dname);
    let profit = await grabProfit("home");
    cl(profit);
    let info = await pullInfo(1);
    ct(info);
    // let t = await test("*");
    // cl(t);
    // let t1 = await test1();
    // cl(t1);
}




// con.connect((e) => {
//     thrw(e);
//     doWork();

// })