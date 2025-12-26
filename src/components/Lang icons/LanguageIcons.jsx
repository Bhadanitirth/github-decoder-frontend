import React from "react";
import { SiTypescript, SiGo, SiRuby, SiSqlite, SiScala, SiLua, SiDocker, SiVim, SiElixir, SiClojure, SiJulia } from "react-icons/si";
import { FaGolang } from "react-icons/fa6";
import { FaJs, FaPython, FaJava, FaPhp, FaCuttlefish, FaSwift, FaRust, FaHtml5, FaCss3, FaNode, FaReact, FaGitAlt, FaDocker } from "react-icons/fa";

const languageIcons = {
    JavaScript: <FaJs className="language-icon" />,
    Python: <FaPython className="language-icon" />,
    Java: <FaJava className="language-icon" />,
    PHP: <FaPhp className="language-icon" />,
    "C++": <FaCuttlefish className="language-icon" />,
    C: <FaCuttlefish className="language-icon" />,
    Swift: <FaSwift className="language-icon" />,
    Rust: <FaRust className="language-icon" />,
    HTML: <FaHtml5 className="language-icon" />,
    CSS: <FaCss3 className="language-icon" />,
    Node: <FaNode className="language-icon" />,
    TypeScript: <SiTypescript className="language-icon" />,
    React: <FaReact className="language-icon" />,
    Go: <SiGo className="language-icon" />,
    Ruby: <SiRuby className="language-icon" />,
    SQL: <SiSqlite className="language-icon" />,
    Scala: <SiScala className="language-icon" />,
    Lua: <SiLua className="language-icon" />,
    Docker: <SiDocker className="language-icon" />,
    Vim: <SiVim className="language-icon" />,
    Elixir: <SiElixir className="language-icon" />,
    Clojure: <SiClojure className="language-icon" />,
    Julia: <SiJulia className="language-icon" />,
    Golang: <FaGolang className="language-icon" />,
    Git: <FaGitAlt className="language-icon" />
};

export default languageIcons;
