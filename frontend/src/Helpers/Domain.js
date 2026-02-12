const server_domain =
    window.location.hostname !== "localhost"
        ? "http://localhost:8000/"
        : "https://ganatech.pythonanywhere.com/";

export { server_domain };
