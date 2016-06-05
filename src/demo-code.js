// This file contains some examples for testing the extension. 
var a;
a = 5;

function test(){}
test()

function test2(a){
    a = 5;
}

function Classy(){}
Classy.prototype.hi = "hello"
var instance = new Classy();
instance.hi

var b = {
    test: "hi"
}
b.test = "hello"
b.test = "hiya"
