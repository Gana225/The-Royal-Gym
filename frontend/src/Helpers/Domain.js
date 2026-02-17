const server_domain =
    window.location.hostname === "localhost"
        ? "http://localhost:8000/"
        : "https://gana.work.gd/";

export { server_domain };
