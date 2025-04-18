﻿export function convertToJavascript(system, userFormula, mathPrefix) {
    var possibleValues = getPossibleValuesForSystem(system);
    var formula = userFormula.toLowerCase().replace(/ /g, '').replace(/math/g, 'Math').replace(/\n/g, '');

    if (formula.indexOf('^') > -1) {
        alert("The '^' character is not allowed. If you're trying to do exponentiation, use the pow function.\nFor instance pow(x,3) to cube x.");
        return null;
    }
    if (formula.split('(').length != formula.split(')').length) {
        alert('Parentheses are not balanced.');
        return null;
    }
    var tokens = formula.split(/[=+\-\,\*\\/^\(\)]/);
    var formula = parseTokens(tokens, formula, possibleValues, mathPrefix);
    if (formula == null) return null;
    var dependentVariable = formula.split("=");
    if (dependentVariable.length != 2) {
        alert("Formula must be a = blah, where a is one of " + possibleValues + ", and blah is a function of same.");
        return null;
    }
    if (possibleValues.indexOf(dependentVariable[0]) < 0) {
        alert('The dependent variable  "' + dependentVariable[0] + '" is not correct for this coordinate system.\n' +
            'You need to use one of ' + possibleValues);
    }
    return formula;
}
export function getDependentVariable(validatedFormula) {
    var dependentVariable = validatedFormula.split("=");
    return dependentVariable[0];
}
function parseTokens(tokens, formula, possibleValues, mathPrefix) {
    var alreadyReplaced = '';
    // note we start at 1. The left side of the '=' sign is tested above.
    for (var i = 1; i < tokens.length; i++) {
        var token = tokens[i];
        if (token.length == 0) continue;
        if (
            token == 'cos' ||
            token == 'cosh' ||
            token == 'abs' ||
            token == 'acos' ||
            token == 'asin' ||
            token == 'atan' ||
            token == 'ceil' ||
            token == 'cos' ||
            token == 'exp' ||
            token == 'floor' ||
            token == 'log' ||
            token == 'max' ||
            token == 'min' ||
            token == 'pow' ||
            token == 'random' ||
            token == 'round' ||
            token == 'sin' ||
            token == 'sinh' ||
            token == 'sqrt' ||
            token == 'tanh' ||
            token == 'tan' ||
            token == 'sign' ||
            token == 'add' ||
            token == 'subtract' ||
            token == 'multiply' ||
            token == 'divide' ||
            token == 'arg' ||
            token == 'inverse' ||
            token == 'conjugate' ||
            token == 'complex' 

            ) {
            // the '(' ensures we don't confuse cosh with cos, for instnce.
            var tokenWithParen = token + "(";
            if (alreadyReplaced.indexOf(tokenWithParen + "zzz") >= 0) continue;
            alreadyReplaced += tokenWithParen + "zzz";
            var regex = new RegExp(token + "\\(", 'g');
            formula = formula.replace(regex, mathPrefix + tokenWithParen);
        }
        else {
            if (token == 'pi' || token == 'e') continue;
            if (token == 'point.x') continue;
            if (token == 'point.y') continue;
            if (token == 'point.z') continue;
            if (possibleValues.indexOf(token) >= 0) continue;
            if (!isNaN(parseFloat(token)) && isFinite(token)) continue;

            alert("I don't understand this: " + token);
            return null;
        }
    }
    return formula + ';';
}
function getPossibleValuesForSystem(system) {
    var possibleValues;
    if (system == "cartesian") {
        possibleValues = "x,y,z,p";
    }
    if (system == "spherical") {
        possibleValues = "radius,phi,theta,p";
    }
    if (system == "toroidal") {
        possibleValues = "radius, phi, theta";
    }
    if (system == "parametric") {
        possibleValues = "x,y,z,u,v,xx,yy,zz,phi,rr,pp,qq,r1,r2,r3,torusknot,point";
    }
    if (system == "cylindrical") {
        possibleValues = "z,radius,phi,p";
    }
    return possibleValues;
}
export function getCleanFormula(userFormula) {
    var formula = userFormula.toLowerCase()
            .replace(' ', '')
            .replace(/math/g, 'Math')
            .replace(/;;/g, ';')
            .replace(/;/g, ';\n')
    ;
    console.log(formula);
    return formula;
}