var todolist = document.querySelector("#todolist");
function getValue(a) {
    if (a.includes("wip")) {
        return 1;
    }
    if (a.includes("done")) {
        return 2;
    }
    return 0;
}
var map = {
    wip: "working",
    done: "done"
}
var list = todolist.innerText.split("]").filter(x => x.length !== 0);

list.sort((a, b) => {
    return getValue(a) - getValue(b);
});
todolist.innerHTML = "";
list.forEach(a => {
    var x = a.split("[");
    var d = document.createElement("span");
    var s = document.createElement("summary");
    d.appendChild(s);
    s.innerHTML = x[0].trim().replaceAll("`", "<code>").replaceAll('#', "</code>");
    var z = document.createElement("span");
    d.classList.add(map[x[1].toLowerCase().trim()] || "todo");
    s.appendChild(z);
    todolist.appendChild(d);
});