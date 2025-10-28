const express = require('express');
const path = require('path');
const session = require('express-session');
const { Sequelize, DataTypes, Op, where } = require('sequelize');
const { create } = require('domain');
const app = express();
const PORT = 3000;
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false
}));
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite'
})

const connect = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync({ force: true });
        console.log('true');
    } catch (e) {
        console.log('false', e);
    }
}

//tables
const Status = sequelize.define(
    'Status',
    {
        title: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        level: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
        timestamps: false,
    },
)

const Badge = sequelize.define(
    'Badge',
    {
        title: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
    },
    {
        timestamps: false,
    },
)

const BadgeToUser = sequelize.define(
    'BadgeToUser',
    {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        badgeId: { type: DataTypes.INTEGER, allowNull: false },
    },
)

const MangaTag = sequelize.define(
    'MangaTag',
    {
        title: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
    }
)

const MangaTagToManga = sequelize.define(
    "MangaTagToManga",
    {
        tagId: { type: DataTypes.INTEGER, allowNull: false },
        mangaId: { type: DataTypes.INTEGER, allowNull: false },
    }
)

const Manga = sequelize.define(
    'Manga',
    {
        title: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
    }
)

const MangaChapter = sequelize.define(
    'MangaChapter',
    {
        title: { type: DataTypes.STRING },
        name: { type: DataTypes.STRING, allowNull: false },
        number: { type: DataTypes.FLOAT, allowNull: false },
        mangaId: { type: DataTypes.INTEGER, allowNull: false },
    }
)

const MangaChapterImage = sequelize.define(
    'MangaChapterImage',
    {
        url: { type: DataTypes.STRING },
        number: { type: DataTypes.INTEGER, allowNull: false },
        mangaChapterId: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
        timestamps: false,
    },
)

const User = sequelize.define(
    'User',
    {
        nickname: { type: DataTypes.STRING, allowNull: false },
        statusId: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        level: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        chaptersReaded: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        email: { type: DataTypes.STRING, allowNull: false },
        password: { type: DataTypes.STRING, allowNull: false },
    }
)

const createSvyazi = async () => {
    User.hasMany(BadgeToUser, {
        foreignKey: 'userId',
        as: 'badge'
    })
    Badge.hasMany(BadgeToUser, {
        foreignKey: 'badgeId',
        as: 'user'
    })
    BadgeToUser.belongsTo(User, {
        foreignKey: 'userId',
        as: 'user'
    })
    BadgeToUser.belongsTo(Badge, {
        foreignKey: 'badgeId',
        as: 'badge'
    })

    Status.hasMany(User, {
        foreignKey: 'statusId',
        as: 'user'
    })
    User.belongsTo(Status, {
        foreignKey: 'statusId',
        as: 'status'
    })

    MangaTag.hasMany(MangaTagToManga, {
        foreignKey: 'tagId',
        as: 'manga'
    })
    Manga.hasMany(MangaTagToManga, {
        foreignKey: 'mangaId',
        as: 'tag'
    })
    MangaTagToManga.belongsTo(MangaTag, {
        foreignKey: 'tagId',
        as: 'tag'
    })
    MangaTagToManga.belongsTo(Manga, {
        foreignKey: 'mangaId',
        as: 'manga'
    })

    Manga.hasMany(MangaChapter, {
        foreignKey: 'mangaId',
        as: 'chapter'
    })
    MangaChapter.belongsTo(Manga, {
        foreignKey: 'mangaId',
        as: 'manga'
    })

    MangaChapter.hasMany(MangaChapterImage, {
        foreignKey: 'mangaChapterId',
        as: 'image'
    })
    MangaChapterImage.belongsTo(MangaChapter, {
        foreignKey: 'mangaChapterId',
        as: 'chapter'
    })
}

const createStatuses = async () => {
    const reader = await Status.create({
        title: 'Читатель',
        name: 'reader',
        level: 0
    });
    const publisher = await Status.create({
        name: 'publisher',
        title: 'Издатель',
        level: 1
    });
    const admin = await Status.create({
        title: 'Администратор',
        name: 'admin',
        level: 2
    });
    await reader.save();
    await publisher.save();
    await admin.save();
}

const createBadges = async () => {
    const welcomeBadge = await Badge.create({
        title: 'Добро пожаловать на МангаХаб',
        name: 'welcome',
        type: 'default'
    })
    const firstWeek = await Badge.create({
        name: 'firstWeek',
        title: 'Неделя на сайте',
        type: 'default'
    })
    const firstChapterBadge = await Badge.create({
        name: 'firstChapter',
        title: 'Первая глава',
        type: 'manga'
    })
    const firstLevelBadge = await Badge.create({
        name: 'firstLvl',
        title: 'Первый уровень',
        type: 'lvl'
    })
    await welcomeBadge.save();
    await firstWeek.save();
    await firstChapterBadge.save();
    await firstLevelBadge.save();
}

const createMangaTags = async () => {
    const manga = await MangaTag.create({
        name: 'manga',
        title: 'Манга',
        type: 'type'
    })
    const manhva = await MangaTag.create({
        name: 'Manhva',
        title: 'Манхва',
        type: 'type'
    })
    const militant = await MangaTag.create({
        name: 'militant',
        title: 'Боевик',
        type: 'genre'
    })
    const drama = await MangaTag.create({
        name: 'drama',
        title: 'Драма',
        type: 'genre'
    })
    const freezed = await MangaTag.create({
        name: 'freezed',
        title: 'Заморожен',
        type: 'status'
    })
    const continous = await MangaTag.create({
        name: 'continous',
        title: 'Продолжается',
        type: 'status'
    })
    const completed = await MangaTag.create({
        name: 'completed',
        title: 'Завершен',
        type: 'status'
    })
    await manga.save();
    await manhva.save();
    await militant.save();
    await drama.save();
    await freezed.save();
    await continous.save();
    await completed.save();
}

const createAdimAccaount = async () => {
    const admin = await User.create({
        nickname: 'Крутой админ',
        statusId: 3,
        level: 100,
        chaptersReaded: 0,
        email: 'adminAcc@gmail.com',
        password: 'passwordQ!1'
    })
    await admin.save();
}

const startServer = async () => {
    await connect();
    await createSvyazi();
    await createStatuses();
    await createBadges();
    await createMangaTags();
    await createAdimAccaount();

    app.listen(PORT, () => {
        console.log('http://localhost:3000')
    })
}

startServer();

//get запросы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.get('/registration', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'registration.html'));
})

app.get('/authorization', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'authorization.html'));
})

app.get('/profile', (req, res) => {
    if (!req.session.user) return res.redirect('/authorization');

    res.sendFile(path.join(__dirname, 'public', 'profile.html'))
})

app.get('/adminPanel', (req, res) => {
    if (!req.session.user) res.redirect('/');
    if (req.session.user.statusId != 3) res.redirect('/');

    res.sendFile(path.join(__dirname, 'public', 'adminPanel.html'))
})

app.get('/publisherPanel', (req, res) => {
    if (!req.session.user) res.redirect('/');
    if (req.session.user.level < 1) res.redirect('/');

    res.sendFile(path.join(__dirname, 'public', 'publisherPanel.html'))
})

//post запросы

//пользователь
app.post('/registration', async (req, res) => {
    const { nickname, email, password } = req.body;

    try {
        const user = await User.findOne({
            where: {
                nickname: nickname
            }
        })

        if (user) throw new Error('Такой пользователь уже существует! <button onclick="window.location.href=`/registration`">Вернутся</button>');

        await createUser(nickname, email, password);

        const newUser = await getUser(email);
        if (!newUser) throw new Error('Пользователя не существует <button onclick="window.location.href=`/registration`">Вернутся</button>');

        req.session.user = {
            nickname: newUser.nickname,
            email: newUser.email,
            password: newUser.password,
            level: newUser.level,
            statusId: newUser.statusId,
            chaptersReaded: newUser.chaptersReaded,
        };

        res.redirect('/');
    } catch (e) {
        res.send(e);
    }

})

app.post('/authorization', (req, res) => {
    const { email, password } = req.body;

    const auth = async () => {
        const user = await getUser(email);

        if (user) {
            if (user.password == password) {
                req.session.user = {
                    nickname: user.nickname,
                    email: user.email,
                    password: user.password,
                    level: user.level,
                    statusId: user.statusId,
                    chaptersReaded: user.chaptersReaded,
                }
                res.redirect('/')
            }
        } else {
            res.status(400).send('Пользователя не существует <button onclick="window.location.href=`/authorization`">Вернутся</button>');
        }
    }

    auth();
})

app.post('/saveProfile', async (req, res) => {
    const { nickname, email, password } = req.body;

    const oldUser = await getUser(email);

    await oldUser.update({
        nickname: nickname,
        email: email,
        password: password
    });

    req.session.user = {
        ...req.session.user,
        nickname: nickname,
        email: email,
        password: password
    };

    res.redirect('/profile')
})

app.post('/createBadge', async (req, res) => {
    const { badgeTitle, badgeName, badgeType } = req.body;

    try {
        if (badgeType != 'lvl' && badgeType != 'manga' && badgeType != 'default') throw new Error('Такого типа беджа не существует');

        const badge = await Badge.findOne({
            where: {
                name: badgeName
            }
        })

        if (badge) throw new Error('Такой бедж уже существует');

        const newBadge = await Badge.create({
            title: badgeTitle,
            name: badgeName,
            type: badgeType
        })

        await newBadge.save();
    } catch (e) {
        res.send(e);
    }
});

app.post('/giveBadge', async (req, res) => {
    const userNickname = req.body.userName;
    const badgeName = req.body.badgeName;
    try {
        if (!userNickname && !badgeName) throw new Error('Нету пользователя или бейджа');

        const user = await User.findOne({
            where: {
                nickname: userNickname,
            }
        });

        if (!user) throw new Error('Пользователя не существует!');

        const badge = await Badge.findOne({
            where: {
                name: badgeName,
            }
        });

        if (!badge) throw new Error('Бейджа не существует!');

        const newBadgeToUser = await BadgeToUser.create({
            userId: user.id,
            badgeId: badge.id,
        })
        await newBadgeToUser.save();

        res.redirect('/');
    } catch (e) {
        res.send(e)
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
})


//manga
app.post('/createManga', async (req, res) => {
    const mangaName = req.body.name;
    const mangaTitle = req.body.title;

    try {
        if (!mangaName) throw new Error('Нету в query название манги!');

        const manga = await Manga.findOne({
            where: {
                name: mangaName,
            }
        })

        if (manga) throw new Error('Такая манга уже существует!');

        const newManga = await Manga.create({
            name: mangaName,
            title: mangaTitle
        });
        await newManga.save();

        res.redirect('/');
    } catch (e) {
        res.send(e);
    }

})

app.post('/createMangaChapter', async (req, res) => {
    const mangaName = req.body.mangaName;
    const chapterName = req.body.chapterName;
    const chapterTitle = req.body.chapterTitle;

    try {
        const manga = await Manga.findOne({
            where: {
                name: mangaName,
            }
        });

        if (!manga) throw new Error('Манга не существует!');

        const chapter = await MangaChapter.findOne({
            where: {
                name: chapterName
            }
        })

        if (chapter) throw new Error('Такая глава уже существует!');

        const lastChapter = await MangaChapter.findOne({
            attributes: [
                [sequelize.fn('MAX', sequelize.col('number')), 'lastChapterNumber']
            ],
            where: {
                mangaId: manga.id
            },
            raw: true
        });

        const curNamber = (parseInt(lastChapter?.lastChapterNumber) || 0) + 1;

        const newChapter = await MangaChapter.create({
            name: chapterName,
            title: chapterTitle,
            mangaId: manga.id,
            number: curNamber,
        })
        await newChapter.save();

        res.redirect('/');
    } catch (e) {
        res.send(e);
    }
})

app.post('/createMangaChapterImage', async (req, res) => {
    const { imgUrl, mangaName, chapterNumber } = req.body;

    try {
        const manga = await Manga.findOne({
            where: {
                name: mangaName,
            }
        });

        if (!manga) throw new Error('Манга не существует!');

        const curChapter = await MangaChapter.findOne({
            where: {
                mangaId: manga.id,
                number: chapterNumber,
            }
        })

        if (!curChapter) throw new Error('Глава не существует!');

        const lastImage = await MangaChapterImage.findOne({
            attributes: [
                [sequelize.fn('MAX', sequelize.col('number')), 'lastImageNumber']
            ],
            where: {
                mangaChapterId: curChapter.id
            },
            raw: true
        });

        const curImgNumber = (parseInt(lastImage?.lastImageNumber) || 0) + 1;

        const chapterImage = await MangaChapterImage.create({
            url: imgUrl,
            mangaChapterId: curChapter.id,
            number: curImgNumber,
        })
        await chapterImage.save();

        res.redirect('/');
    } catch (e) {
        res.send(e);
    }
})

app.post('/createMangaTag', async (req, res) => {
    const { tagName, tagTitle, tagType } = req.body;

    try {
        if (tagType != 'type' && tagType != 'genre') throw new Error('Неправильно написан тег!');

        const tag = await MangaTag.findOne({
            where: {
                name: tagName
            }
        })

        if (tag) throw new Error('Такой тег существует!');

        const newTag = await MangaTag.create({
            title: tagTitle,
            name: tagName,
            type: tagType
        })

        await newTag.save();

        res.redirect('/');
    } catch (e) {
        res.send(e);
    }
})

app.post('/giveTag', async (req, res) => {
    const { tagName, mangaName } = req.body;

    try {
        const manga = await Manga.findOne({
            where: {
                name: mangaName,
            }
        });

        if (!manga) throw new Error('Манга не существует!');

        const tag = await MangaTag.findOne({
            where: {
                name: tagName,
            }
        });

        if (!tag) throw new Error('Тег не существует!');

        const tagToManga = MangaTagToManga.create({
            tagId: tag.id,
            mangaId: manga.id
        })

        tagToManga.save();
    } catch (e) {
        res.send(e);
    }
})

//доп функции

app.get('/sessionUser', async (req, res) => {
    const userData = await User.findOne({
        where: {
            email: req.session.user.email,
        },
        include: [{
            model: Status,
            as: 'status',
            attributes: ['title']
        }]
    });

    console.log({ nickname: userData.nickname, email: userData.email, password: userData.password, level: userData.level, chaptersReaded: userData.chaptersReaded, status: userData.status.title });

    res.json({ nickname: userData.nickname, email: userData.email, password: userData.password, level: userData.level, chaptersReaded: userData.chaptersReaded, status: userData.status.title });
})

async function getUser(email1) {
    return await User.findOne({ where: { email: email1 } })
}


async function createUser(nick, email, password) {
    const newUser = await User.create({
        nickname: nick,
        email: email,
        password: password,
        level: 0,
        statusId: 1,
        chaptersReaded: 0,
    });
    await newUser.save();
}