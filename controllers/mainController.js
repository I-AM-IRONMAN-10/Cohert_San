const service = require("../services/mainService");

exports.create = (req, res) => {
    try {
        if (!req.body.title || !req.body.secret) {
            return res.status(400).json({ error: "Title and secret are required" });
        }
        const item = service.create(req.body);
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.list = (req, res) => {
    try {
        const data = service.list();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};

exports.remove = (req, res) => {
    try {
        service.remove(req.params.id);
        res.status(200).json({ message: "deleted" });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
