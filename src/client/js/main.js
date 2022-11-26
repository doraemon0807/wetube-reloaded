import regeneratorRuntime from "regenerator-runtime";
import "../scss/styles.scss";

export const isHeroku = process.env.NODE_ENV === "production";
