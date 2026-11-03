import React from "react";

export default function PageState({ title, children }) {
  return (
    <section className="state-card" role="status">
      <h1>{title}</h1>
      {children}
    </section>
  );
}
