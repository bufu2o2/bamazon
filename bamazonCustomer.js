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

let product = {
    list: (x) => {
        let p = "SELECT " + x + " FROM products";
        con.query(p, (e, r, f) => {
            thrw(e);
            cl(br + ch.greenBright(hr + "   The products for sale   " + hr) + br);
            ct(r);
            cl(br);
            con.end();
        });
    },
    buy: (itemid) => {
        let stock;
        let sq = "SELECT stock_quantity FROM products WHERE item_id = " + itemid;
        con.query(sq, (e,r,f) => {
            thrw(e);
            stock = r[0].stock_quantity;
        });
        let ii = ""
    },
}


con.connect((e) => {
    thrw(e);

    product.buy(4);
})
