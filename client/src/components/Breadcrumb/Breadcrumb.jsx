import React from "react";

const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol style={styles.list}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} style={styles.item}>
              {item.href && !isLast ? (
                <a href={item.href} style={styles.link}>
                  {item.label}
                </a>
              ) : (
                <span style={styles.current}>{item.label}</span>
              )}
              {!isLast && <span style={styles.separator}>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

const styles = {
  list: {
    display: "flex",
    alignItems: "center",
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
  item: {
    display: "flex",
    alignItems: "center",
  },
  link: {
    color: "#737373",
    textDecoration: "none",
    fontWeight: 500,
  },
  current: {
    color: "#0a8769",
    fontWeight: 500,
  },
  separator: {
    margin: "0 8px",
    color: "#9ca3af",
  },
};
