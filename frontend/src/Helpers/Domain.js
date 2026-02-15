const server_domain =
    window.location.hostname !== "localhost"
        ? "http://localhost:8000/"
        : "http://129.159.21.34/admin/";

export { server_domain };
