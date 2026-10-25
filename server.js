
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const session = require("express-session");

const app = express();

app.use(
    cors({
        origin: "https://nubug.org",
        credentials: true,
    })
);

app.use(express.json());

app.use(
    session({
        name: "nubugh.sid",
        secret: process.env.SESSION_SECRET || "nubugh-secret-change-this",
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 1000 * 60 * 60 * 8,
        },
    })
);

const db = mysql.createConnection({
    host: "localhost",
    user: "u401308408_nubugroot",
    password: "NuBug1234",
    database: "u401308408_nubug",
});

db.connect((err) => {
    if (err) {
        console.log("Gabim me MySQL:", err);
    } else {
        console.log("MySQL u lidh me sukses!");
    }
});


app.get("/", (req, res) => {
    res.json({
        message: "Backend-i po punon!"
    });
});



//1-STUDENTET


function kontrolloLogin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({
            message: "Duhet të kyçesh për të vazhduar.",
        });
    }

    next();
}


// Futja e te dhenave
app.post("/students", (req, res) => {

    // Gjenerimi i student_code
    const student_code = Math.floor(
        10000 + Math.random() * 90000
    );

    const {
        full_name,
        email,
        country,
        level_id,
        pasaporta
    } = req.body;


    const sql = `
        INSERT INTO nxenesit 
        (student_code, full_name, email, country, level_id, pasaporta)
        VALUES (?, ?, ?, ?, ?, ?)
    `;


    db.query(
        sql,[
            student_code,
            full_name,
            email,
            country,
            level_id,
            pasaporta
        ],
        (err, result) => {

            if (err) {
                console.log(err);

                return res.status(500).json({
                    message: "Gabim gjatë ruajtjes",
                    error: err.message
                });
            }

            res.json({
                message: "Të dhënat u ruajtën!",
                id: result.insertId,
                student_code: student_code
            });
        }
    );
});

// Marrja e te dhenave

app.get("/students", (req, res) => {

    const sql = "SELECT * FROM nxenesit";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Gabim gjatë marrjes së të dhënave",
                error: err.message
            });
        }

        res.json(result);
    });
});

// Ndryshimi
app.put("/students/:id", (req, res) => {

    const { id } = req.params;

    const {
        full_name,
        email,
        country,
        level_id,
        pasaporta
    } = req.body;

    const sql = `
        UPDATE nxenesit
        SET
            full_name = ?,
            email = ?,
            country = ?,
            level_id = ?,
            pasaporta = ?
            WHERE id = ?
    `;

    db.query(
        sql,
        [
            full_name,
            email,
            country,
            level_id,
            pasaporta,
            id
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Gabim gjatë editimit",
                    error: err.message
                });

            }

            res.json({
                message: "Nxënësi u ndryshua me sukses!"
            });

        }
    );
});


// Fshirja

app.delete("/students/:id", (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM nxenesit WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Gabim gjatë fshirjes",
                error: err.message
            });
        }

        res.json({
            message: "Nxënësi u fshi me sukses!"
        });
    });
});







// LENDET
// Marrja e te dhenave
app.get("/lendet", (req, res) => {

    const sql = "SELECT * FROM lendet";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Gabim gjatë marrjes së të dhënave",
                error: err.message
            });
        }

        res.json(result);
    });
});

// Nivelet
app.get("/musteva", (req, res) => {

    const sql = "SELECT * FROM nivelet";

    db.query(sql, (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Gabim gjatë marrjes së të dhënave",
                error: err.message
            });
        }

        res.json(result);
    });
});


// Shfaqja e lendeve me mustewa 

app.get("/musteva-lendet", (req, res) => {

    const sql = `
        SELECT
            ml.id AS id,
            m.id AS nivelet_id,
            m.name AS nivelet,
            l.id AS lenda_id,
            l.name AS lendet
        FROM nivelet m
        LEFT JOIN nivelet_lendet ml
            ON m.id = ml.nivelet_id
        LEFT JOIN lendet l
            ON ml.lendet_id = l.id
        ORDER BY m.id, l.id;
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.error(err);

            return res.status(500).json({
                message: "Gabim në database"
            });
        }

        res.json(result);
    });
});

// Futja e te dhenave
app.post("/musteva-lendet", (req, res) => {

    const { musteva_id, lenda_id } = req.body;

    const sql = `
        INSERT INTO nivelet_lendet
        (nivelet_id, lendet_id)
        VALUES (?, ?)
    `;

    db.query(
        sql,
        [musteva_id, lenda_id],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Gabim gjatë ruajtjes"
                });
            }

            res.json({
                message: "Lidhja u ruajt me sukses"
            });
        }
    );
});

// UPDATE LENDET
app.put("/musteva-lendet/:id", (req, res) => {

    const { id } = req.params;
    const { musteva_id, lenda_id } = req.body;

    const sql = `
        UPDATE nivelet_lendet
        SET nivelet_id = ?, lendet_id = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [musteva_id, lenda_id, id],
        (err, result) => {

            if (err) {
                console.error(err);

                return res.status(500).json({
                    message: "Gabim gjatë ndryshimit!"
                });
            }

            res.json({
                message: "Lidhja u ndryshua me sukses!"
            });

        }
    );
});


// Fshirja
// DELETE LIDHJEN
app.delete("/musteva-lendet/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM nivelet_lendet
        WHERE id = ?
    `;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("DELETE ERROR:", err);

            return res.status(500).json({
                message: "Gabim gjatë fshirjes!"
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Nuk u gjet lidhja!"
            });
        }

        res.json({
            message: "Lidhja u fshi me sukses!"
        });
    });
});


// REZULTATET

app.get("/rezultatet", (req, res) => {

    const sql = `
        SELECT
            n.id AS student_id,
            n.student_code,
            n.full_name,

            ni.id AS nivelet_id,
            ni.name AS niveli,

            nl.id AS level_subject_id,

            l.id AS lenda_id,
            l.name AS lenda

        FROM nxenesit n

        LEFT JOIN nivelet ni
            ON n.level_id = ni.name

        LEFT JOIN nivelet_lendet nl
            ON ni.id = nl.nivelet_id

        LEFT JOIN lendet l
            ON nl.lendet_id = l.id

        ORDER BY n.id, l.id
    `;

    db.query(sql, (err, result) => {

        if (err) {
            console.error("REZULTATET ERROR:", err);

            return res.status(500).json({
                message: "Gabim në databazë",
                error: err.message
            });
        }

        const students = {};

        result.forEach((row) => {

            if (!students[row.student_id]) {

                students[row.student_id] = {
                    id: row.student_id,
                    student_code: row.student_code,
                    full_name: row.full_name,
                    niveli: row.niveli,
                    lendet: []
                };

            }

            if (row.lenda) {

                students[row.student_id].lendet.push({
                    id: row.lenda_id,
                    name: row.lenda,
                    level_subject_id: row.level_subject_id
                });

            }

        });

        res.json(Object.values(students));
    });
});


// Piket

app.post("/piket", (req, res) => {

    const {
        student_id,
        level_subject_id,
        score
    } = req.body;


    // Kontrollo nëse janë dërguar të gjitha të dhënat
    if (
        student_id === undefined ||
        level_subject_id === undefined ||
        score === undefined
    ) {

        return res.status(400).json({
            message: "Të gjitha të dhënat janë të nevojshme"
        });

    }


    // Kontrollo pikët
    if (score < 0 || score > 100) {

        return res.status(400).json({
            message: "Pikët duhet të jenë nga 0 deri në 100"
        });

    }


    const sql = `
        INSERT INTO piket
        (
            student_id,
            level_subject_id,
            score
        )
        VALUES (?, ?, ?)
    `;


    db.query(
        sql,
        [
            student_id,
            level_subject_id,
            score
        ],
        (err, result) => {

            if (err) {

                console.error("PIKET ERROR:", err);

                return res.status(500).json({
                    message: "Gabim gjatë ruajtjes së pikëve",
                    error: err.message
                });

            }


            res.json({
                message: "Pikët u ruajtën me sukses!",
                id: result.insertId
            });

        }
    );

});


// Dashbordi
app.get("/dashboard-statistika", (req, res) => {

    const sql = `
        SELECT
            (SELECT COUNT(*) FROM nxenesit) AS nxenes,
            (SELECT COUNT(*) FROM lendet) AS lende,
            (SELECT COUNT(*) FROM piket) AS rezultate
    `;

    db.query(sql, (err, result) => {

        if (err) {

            console.error("DASHBOARD STATISTIKA ERROR:", err);

            return res.status(500).json({
                message: "Gabim gjatë marrjes së statistikave",
                error: err.message
            });

        }

        res.json({
            nxenes: result[0].nxenes,
            lende: result[0].lende,
            rezultate: result[0].rezultate
        });

    });

});

app.get("/me", kontrolloLogin, (req, res) => {
    res.json({
        authenticated: true,
    });
});





// Te gjitha rezultatet 





app.get('/tegjitha', (req, res) => {
    const sql = `
        SELECT
            n.id,
            n.student_code,
            n.full_name,
            n.country,
            n.level_id,

            p.id AS pika_id,
            p.score,
            nv.id AS rezultati_niveli_id,
            nv.name AS rezultati_niveli,
            l.id AS lenda_id,
            l.name AS lenda

        FROM nxenesit n

        LEFT JOIN piket p
            ON p.student_id = n.id

        LEFT JOIN nivelet_lendet nl
            ON nl.id = p.level_subject_id

        LEFT JOIN nivelet nv
            ON nv.id = nl.nivelet_id

        LEFT JOIN lendet l
            ON l.id = nl.lendet_id

        ORDER BY
            n.full_name,
            nv.id,
            l.name
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Gabim në /tegjitha:', err);

            return res.status(500).json({
                message: 'Gabim gjatë marrjes së studentëve.',
                error: err.message
            });
        }

        // Grupojmë rreshtat sipas studentit,
        // ndërsa pikët i ruajmë të ndara sipas nivelit.
        const studentet = new Map();

        results.forEach((row) => {
            if (!studentet.has(row.id)) {
                studentet.set(row.id, {
                    id: row.id,
                    student_code: row.student_code,
                    full_name: row.full_name,
                    country: row.country,
                    level_id: row.level_id,
                    rezultatet: []
                });
            }

            if (row.pika_id !== null) {
                studentet.get(row.id).rezultatet.push({
                    pika_id: row.pika_id,
                    niveli_id: row.rezultati_niveli_id,
                    niveli: row.rezultati_niveli,
                    lenda_id: row.lenda_id,
                    lenda: row.lenda,
                    score: row.score
                });
            }
        });

        res.json(Array.from(studentet.values()));
    });
});



// Edit edhe delete

// EDITIMI I STUDENTIT
app.put("/tegjitha/:id", (req, res) => {
    const { id } = req.params;
    const { student_code, full_name, country } = req.body;

    // Kontrollojmë vetëm fushat që editohen në React.
    if (
        student_code === undefined ||
        !String(student_code).trim() ||
        full_name === undefined ||
        !String(full_name).trim() ||
        country === undefined ||
        !String(country).trim()
    ) {
        return res.status(400).json({
            message: "Plotëso kodin, emrin e plotë dhe shtetin."
        });
    }

    const sql = `
        UPDATE nxenesit
        SET
            student_code = ?,
            full_name = ?,
            country = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            String(student_code).trim(),
            String(full_name).trim(),
            String(country).trim(),
            id
        ],
        (err, result) => {
            if (err) {
                console.error("Gabim gjatë editimit të studentit:", err);

                return res.status(500).json({
                    message: "Nuk u arrit të ndryshohet studenti.",
                    error: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Studenti nuk u gjet."
                });
            }

            res.json({
                message: "Studenti u ndryshua me sukses!"
            });
        }
    );
});



// FSHIJE STUDENTIN
app.delete('/tegjitha/:id', (req, res) => {
    const { id } = req.params;

    // Së pari fshihen pikët që i përkasin studentit.
    db.query(
        'DELETE FROM piket WHERE student_id = ?',
        [id],
        (err) => {
            if (err) {
                console.error('Gabim gjatë fshirjes së pikëve:', err);
                return res.status(500).json({
                    message: 'Nuk u arritën të fshihen pikët e studentit.'
                });
            }

            // Pastaj fshihet studenti.
            db.query(
                'DELETE FROM nxenesit WHERE id = ?',
                [id],
                (err, result) => {
                    if (err) {
                        console.error('Gabim gjatë fshirjes së studentit:', err);
                        return res.status(500).json({
                            message: 'Nuk u arrit të fshihet studenti.'
                        });
                    }

                    if (result.affectedRows === 0) {
                        return res.status(404).json({
                            message: 'Studenti nuk u gjet.'
                        });
                    }

                    res.json({
                        message: 'Studenti dhe pikët e tij u fshinë me sukses.'
                    });
                }
            );
        }
    );
});


// EDITIMI I PIKËVE
app.put("/piket/:id", (req, res) => {
    const { id } = req.params;
    const { score } = req.body;

    const piket = Number(score);

    if (
        score === undefined ||
        score === null ||
        score === "" ||
        !Number.isFinite(piket) ||
        piket < 0 ||
        piket > 100
    ) {
        return res.status(400).json({
            message: "Pikët duhet të jenë numër nga 0 deri në 100."
        });
    }

    // Kontrollojmë nëse ekzistojnë pikët.
    db.query(
        "SELECT id FROM piket WHERE id = ?",
        [id],
        (err, rows) => {
            if (err) {
                console.error("Gabim gjatë kontrollimit të pikëve:", err);

                return res.status(500).json({
                    message: "Gabim gjatë kontrollimit të pikëve."
                });
            }

            if (rows.length === 0) {
                return res.status(404).json({
                    message: "Rezultati nuk u gjet."
                });
            }

            // Ndryshojmë vetëm pikët e atij rezultati.
            db.query(
                "UPDATE piket SET score = ? WHERE id = ?",
                [piket, id],
                (err) => {
                    if (err) {
                        console.error("Gabim gjatë editimit të pikëve:", err);

                        return res.status(500).json({
                            message: "Nuk u arritën të ndryshohen pikët."
                        });
                    }

                    res.json({
                        message: "Pikët u ndryshuan me sukses!",
                        pika_id: Number(id),
                        score: piket
                    });
                }
            );
        }
    );
});



// FSHI VETËM REZULTATET E NJË NIVELI TË STUDENTIT
app.delete("/tegjitha/:id/niveli/:niveliId", (req, res) => {
    const { id, niveliId } = req.params;

    const sql = `
        DELETE p
        FROM piket p
        INNER JOIN nivelet_lendet nl
            ON nl.id = p.level_subject_id
        WHERE p.student_id = ?
        AND nl.nivelet_id = ?
    `;

    db.query(sql, [id, niveliId], (err, result) => {
        if (err) {
            console.error("Gabim gjatë fshirjes së nivelit:", err);

            return res.status(500).json({
                message: "Nuk u arritën të fshihen rezultatet e nivelit.",
                error: err.message
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Nuk u gjetën rezultate për këtë nivel."
            });
        }

        res.json({
            message: "Rezultatet e nivelit u fshinë me sukses!",
            rezultateTeFshira: result.affectedRows
        });
    });
});










app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email-i dhe fjalëkalimi janë të detyrueshëm.",
        });
    }

    const sql = `
        SELECT id,email, password
        FROM users
        WHERE email = ?
        LIMIT 1
    `;

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("LOGIN ERROR:", err);

            return res.status(500).json({
                message: "Gabim gjatë kyçjes.",
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                message: "Email-i ose fjalëkalimi është gabim.",
            });
        }

        const user = results[0];

        // Ky krahasim vlen vetëm nëse fjalëkalimi ruhet tekst i thjeshtë.
        if (user.password !== password) {
            return res.status(401).json({
                message: "Email-i ose fjalëkalimi është gabim.",
            });
        }

        req.session.userId = user.id;

        req.session.save((err) => {
            if (err) {
                console.error("SESSION ERROR:", err);

                return res.status(500).json({
                    message: "Sesioni nuk u ruajt.",
                });
            }

            return res.json({
                    message: "U kyçe me sukses!",
                    authenticated: true,
                    user: {
                    id: user.id,
                    email: user.email,
                },
            });
        });
    });
});

app.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("LOGOUT ERROR:", err);

            return res.status(500).json({
                message: "Gabim gjatë daljes.",
            });
        }

        res.clearCookie("nubugh.sid");

        return res.json({
            message: "U çkyçe me sukses!",
        });
    });
});




// =========================
// START SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Serveri po punon në portin ${PORT}`);
});