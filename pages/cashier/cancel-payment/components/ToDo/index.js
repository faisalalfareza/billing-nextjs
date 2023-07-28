import React from "react";

function todo({ todoList }) {
    const { id, title, completed } = todoList;

    const heading = <h1>{title}</h1>;
    const text = completed ? <strike>{heading}</strike> : heading;
    
    return <div data-testid={`todo-${id}`}>{text}</div>;
}

export default todo;