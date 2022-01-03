// Author:     Siddharth Bhattacharya
// Date:       11/23/21
// Comments:   This is an interpreter project written in javascript as part of our CS220 coursework. 
//             - Constructs an interpreter with the capability of interpreting and evaluating expressions and programs. 
//             - interpExpression utilizes a state which holds the values of variables in key-value pairs and an expression that has been broken down by a custom library.  

// Functions
// interpExpression(state: State, e: Expr): number | boolean
function interpExpression(state, e) {
  switch (e.kind) {
    case "boolean": { return e.value; }
    case "number": { return e.value; } 
    case "variable": { 
      if (lib220.getProperty(state, e.name).found) {
        return lib220.getProperty(state, e.name).value; 
      } else {
        console.log("Variable does not exist.");
        assert(false);
      }
    }
    case "operator": {
      let v1 = interpExpression(state, e.e1);
      let v2 = interpExpression(state, e.e2);

      if (typeof(v1) === "number" && typeof(v2) === "number") {
        switch (e.op) { 
          // number
          case "+": { return v1 + v2; } 
          case "-": { return v1 - v2; } 
          case "*": { return v1 * v2; } 
          case "/": { return v1 / v2; }
          // boolean
          case "<": { return v1 < v2; } 
          case ">": { return v1 > v2; } 
          case "<=": { return v1 <= v2; } 
          case ">=": { return v1 >= v2; } 
          case "===": { return v1 === v2; }  
        }

      } else if (typeof(v1) === "boolean" && typeof(v2) === "boolean") {
        switch (e.op) { 
          // boolean
          case "&&": { return v1 && v2; } 
          case "||": { return v1 || v2; } 
          case "===": { return v1 === v2; } 
        }

      } else {
        console.log("Type mismatch.");
        assert(false); 
      }
    }
  }

  console.log("Invalid expression.");
  assert(false); 
}

// interpBody(state: State, b: body): void
function interpBody(state, b) {
  b.forEach(s => interpStatement(state, s));
}

// interpStatement(state: State, p: Stmt): void
function interpStatement(state, p) {
  switch (p.kind) {
    case "let": { 
      if (!lib220.getProperty(state, p.name).found) {
        lib220.setProperty(state, p.name, interpExpression(state, p.expression));  
      } else {
        console.log("Variable " + p.name + " has already been declared.");
        assert(false); 
      }

      return;
    }
    case "assignment": { 
      if (lib220.getProperty(state, p.name).found) {
        lib220.setProperty(state, p.name, interpExpression(state, p.expression));  
      } else {
        console.log("Variable " + p.name + " has not yet been declared.");
        assert(false); 
      }

      return; 
    }
    case "if": { interpExpression(state, p.test) ? interpBody(state, p.truePart) : interpBody(state, p.falsePart); return; }
    case "while": { while (interpExpression(state, p.test)) { interpBody(state, p.body); } return; }
    case "print": { console.log(interpExpression(state, p.expression)); return; }
  }

  console.log("Invalid statement.");
  assert(false); 
}

// interpProgram(p: Stmt[]): State
function interpProgram(p) {
  let state = { };
  p.forEach(s => interpStatement(state, s));
  
  return state;
}

// Tests
test("multiplication with a variable", function() {
  let r = interpExpression({ x: 10 }, parser.parseExpression("x * 2").value);
  assert(r === 20);
});

test("assignment", function() {
  let st = interpProgram(parser.parseProgram("let x = 10; x = 20;").value);
  assert(st.x === 20);
});

test("if-else and block evaluation", function() {
  let st = interpProgram(parser.parseProgram("let x = 5; if (true) { x = 10; } else { x = 0; }").value);
  assert(st.x === 10);
});