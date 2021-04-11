import React from "react";
import "./Table.css";
import numeral from "numeral";

function Table({ countries }) {
  return (
    <div className="table">
      {/* SPLIT APART, DESTRUCTURING COUNTRIES OBJECT */}
      {countries.map(({ country, cases }) => (
        <tr>
          {/* EMMET FOR KEYBOARD SHORTCUTS?? */}
          <td>{country}</td>
          <td>
            <strong>{numeral(cases).format("000,000")}</strong>
          </td>
        </tr>
      ))}
    </div>
  );
}

export default Table;
