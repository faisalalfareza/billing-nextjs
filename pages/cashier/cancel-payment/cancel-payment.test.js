import '@testing-library/jest-dom';
import { render, screen, cleanup } from "@testing-library/react";
import renderer from "react-test-renderer";

afterEach(() => cleanup());

import ToDo from "./components/ToDo";
describe("CHILD COMPONENT: TODO", () => {
    let todoObj = { id: 1, title: "Faisal Alfareza", completed: false };

    test('should renders "todo" component w/ uncompleted job', () => {
        render(<ToDo todoList={todoObj} />);
        
        const e = screen.getByTestId('todo-1');
        expect(e).toBeInTheDocument();
        expect(e).toHaveTextContent('Faisal Alfareza');
        expect(e).not.toContainHTML('<div data-testid="todo-1"><strike><h1>Faisal Alfareza</h1></strike></div>');
    });
    test('should renders "todo" component w/ some completed job', () => {
        todoObj.completed = true;
        render(<ToDo todoList={todoObj} />);
        
        const e = screen.getByTestId('todo-1');
        expect(e).toBeInTheDocument();
        expect(e).toHaveTextContent('Faisal Alfareza');
        expect(e).toContainHTML('<div data-testid="todo-1"><strike><h1>Faisal Alfareza</h1></strike></div>');
    });
    test('should renders "todo" component matches snapshot', () => {
        todoObj.completed = true;
        const tree = renderer.create(<ToDo todoList={todoObj} />).toJSON();
        expect(tree).toMatchSnapshot();
    });
});

import DetailCancelPayment from "./components/DetailCancelPayment";
describe("CHILD COMPONENT: DETAIL CANCEL PAYMENT", () => {
    test('should renders "detailcancelpayment" modal component', () => {
        // expect(component.find('DetailCancelPayment')).to;
        render(<DetailCancelPayment isOpen={true} params={{ billingHeaderId: 1 }} />);
    });
});