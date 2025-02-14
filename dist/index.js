var _a;
import express from "express";
const app = express();
const PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 3000;
app.get('/', (req, res) => {
    res.send('hello world');
});
app.listen(PORT, () => {
    console.log(`app listening in http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map