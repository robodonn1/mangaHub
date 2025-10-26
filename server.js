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
const StatusTable = sequelize.define(
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

const Badges = sequelize.define(
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

const BadgesToUsers = sequelize.define(
    'BadgeToUser',
    {
        userId: { type: DataTypes.INTEGER, allowNull: false },
        badgeId: { type: DataTypes.INTEGER, allowNull: false },
    },
)

const MangaTags = sequelize.define(
    'MangaTag',
    {
        title: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        type: { type: DataTypes.STRING, allowNull: false },
    }
)

const MangaTagsToMangas = sequelize.define(
    "MangaTagToManga",
    {
        tagId: { type: DataTypes.INTEGER, allowNull: false },
        mangaId: { type: DataTypes.INTEGER, allowNull: false },
    }
)

const Mangas = sequelize.define(
    'Manga',
    {
        title: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
    }
)

const MangaChapters = sequelize.define(
    'MangaChapter',
    {
        title: { type: DataTypes.STRING, allowNull: false },
        name: { type: DataTypes.STRING, allowNull: false },
        number: { type: DataTypes.FLOAT, allowNull: false },
        mangaId: { type: DataTypes.INTEGER, allowNull: false },
    }
)

const MangaChapterImages = sequelize.define(
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

const Users = sequelize.define(
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
    Users.hasMany(BadgesToUsers, {
        foreignKey: 'userId',
        as: 'badge'
    })
    Badges.hasMany(BadgesToUsers, {
        foreignKey: 'badgeId',
        as: 'user'
    })
    BadgesToUsers.belongsTo(Users, {
        foreignKey: 'userId',
        as: 'user'
    })
    BadgesToUsers.belongsTo(Badges, {
        foreignKey: 'badgeId',
        as: 'badge'
    })

    StatusTable.hasOne(Users, {
        foreignKey: 'statusId',
        as: 'user'
    })
    Users.belongsTo(StatusTable, {
        foreignKey: 'statusId',
        as: 'status'
    })

    MangaTags.hasMany(MangaTagsToMangas, {
        foreignKey: 'tagId',
        as: 'manga'
    })
    Mangas.hasMany(MangaTagsToMangas, {
        foreignKey: 'mangaId',
        as: 'tag'
    })
    MangaTagsToMangas.belongsTo(MangaTags, {
        foreignKey: 'tagId',
        as: 'tag'
    })
    MangaTagsToMangas.belongsTo(Mangas, {
        foreignKey: 'mangaId',
        as: 'manga'
    })

    Mangas.hasMany(MangaChapters, {
        foreignKey: 'mangaId',
        as: 'chapter'
    })
    MangaChapters.belongsTo(Mangas, {
        foreignKey: 'mangaId',
        as: 'manga'
    })

    MangaChapters.hasMany(MangaChapterImages, {
        foreignKey: 'mangaChapterId',
        as: 'image'
    })
    MangaChapterImages.belongsTo(MangaChapters, {
        foreignKey: 'mangaChapterId',
        as: 'chapter'
    })
}

const createSvyaz = async () => await createSvyazi();
createSvyaz();

const conn = async () => { await connect(); }
conn();

const createStatuses = async () => {
    const reader = await StatusTable.create({
        title: 'Читатель',
        name: 'reader',
        level: 0
    });
    const publisher = await StatusTable.create({
        name: 'publisher',
        title: 'Издатель',
        level: 1
    });
    const admin = await StatusTable.create({
        title: 'Администратор',
        name: 'admin',
        level: 2
    });
    await reader.save();
    await publisher.save();
    await admin.save();
}
createStatuses();

const createBadges = async () => {
    const welcomeBadge = await Badges.create({
        title: 'Добро пожаловать на МангаХаб',
        name: 'welcome',
        type: 'default'
    })
    const firstWeek = await Badges.create({
        name: 'firstWeek',
        title: 'Неделя на сайте',
        type: 'default'
    })
    const firstChapterBadge = await Badges.create({
        name: 'firstChapter',
        title: 'Первая глава',
        type: 'manga'
    })
    const firstLevelBadge = await Badges.create({
        name: 'firstLvl',
        title: 'Первый уровень',
        type: 'lvl'
    })
    await welcomeBadge.save();
    await firstWeek.save();
    await firstChapterBadge.save();
    await firstLevelBadge.save();
}
createBadges();

const createMangaTags = async () => {
    const manga = await MangaTags.create({
        name: 'manga',
        title: 'Манга',
        type: 'type'
    })
    const manhva = await MangaTags.create({
        name: 'Manhva',
        title: 'Манхва',
        type: 'type'
    })
    const militant = await MangaTags.create({
        name: 'militant',
        title: 'Боевик',
        type: 'genre'
    })
    const drama = await MangaTags.create({
        name: 'drama',
        title: 'Драма',
        type: 'genre'
    })
    await manga.save();
    await manhva.save();
    await militant.save();
    await drama.save();
}
createMangaTags();

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


//post запросы

//пользователь
app.post('/registration', async (req, res) => {
    const { nickname, email, password } = req.body;

    try {
        const user = await Users.findOne({
            where: {
                nickname: nickname
            }
        })

        if (user) throw new Error('Такой пользователь уже существует! <button onclick="window.location.href=`/registration`">Вернутся</button>');

        await createUser(nickname, email, password);
        const newUser = await getUser(email);
        if (newUser) throw new Error('Пользователя не существует <button onclick="window.location.href=`/registration`">Вернутся</button>');

        req.session.user = {
            nickname: user.nickname,
            email: user.email,
            password: user.password,
            level: user.level,
            statusId: user.statusId,
            chaptersReaded: user.chaptersReaded,
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

app.post('/createBadge', async (req, res) => {
    const { badgeTitle, badgeName, badgeType } = req.body;

    try {
        if (badgeType != 'lvl' && badgeType != 'manga' && badgeType != 'default') throw new Error('Такого типа беджа не существует');

        const badge = await Badges.findOne({
            where: {
                name: badgeName
            }
        })

        if (badge) throw new Error('Такой бедж уже существует');

        const newBadge = await Badges.create({
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

        const user = await Users.findOne({
            where: {
                nickname: userNickname,
            }
        });

        if (!user) throw new Error('Пользователя не существует!');

        const badge = await Badges.findOne({
            where: {
                name: badgeName,
            }
        });

        if (!badge) throw new Error('Бейджа не существует!');

        const BadgeToUser = await BadgesToUsers.create({
            userId: user.id,
            badgeId: badge.id,
        })
        await BadgeToUser.save();

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

        const manga = await Mangas.findOne({
            where: {
                name: mangaName,
            }
        })

        if (manga) throw new Error('Такая манга уже существует!');

        const newManga = await Mangas.create({
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
        const manga = await Mangas.findOne({
            where: {
                name: mangaName,
            }
        });

        if (!manga) throw new Error('Манга не существует!');

        const chapter = await MangaChapters.findOne({
            where: {
                name: chapterName
            }
        })

        if (chapter) throw new Error('Такая глава уже существует!');

        const lastChapter = await MangaChapters.findOne({
            attributes: [
                [sequelize.fn('MAX', sequelize.col('number')), 'lastChapterNumber']
            ],
            where: {
                mangaId: manga.id
            },
            raw: true
        });

        const curNamber = (parseInt(lastChapter?.lastChapterNumber) || 0) + 1;

        const newChapter = await MangaChapters.create({
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

app.post('/createMangaChapterImages', async (req, res) => {
    const { imgUrl, mangaName, chapterNumber } = req.body;

    try {
        const manga = await Mangas.findOne({
            where: {
                name: mangaName,
            }
        });

        if (!manga) throw new Error('Манга не существует!');

        const curChapter = await MangaChapters.findOne({
            where: {
                mangaId: manga.id,
                number: chapterNumber,
            }
        })

        if (!curChapter) throw new Error('Глава не существует!');

        const lastImage = await MangaChapterImages.findOne({
            attributes: [
                [sequelize.fn('MAX', sequelize.col('number')), 'lastImageNumber']
            ],
            where: {
                chapterId: curChapter.id
            },
            raw: true
        });

        const curImgNumber = (parseInt(lastImage?.lastImageNumber) || 0) + 1;

        const chapterImage = await MangaChapterImages.create({
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
        if (tagType != 'type' && tagType != 'genre' && tagType != 'status') throw new Error('Неправильно написан тег!');

        const tag = await MangaTags.findOne({
            where: {
                name: tagName
            }
        })

        if (tag) throw new Error('Такой тег существует!');

        const newTag = await MangaTags.create({
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
        const manga = await Mangas.findOne({
            where: {
                name: mangaName,
            }
        });

        if (!manga) throw new Error('Манга не существует!');

        const tag = await MangaTags.findOne({
            where: {
                name: tagName,
            }
        });

        if (!tag) throw new Error('Манга не существует!');

        const tagToManga = MangaTagsToMangas.create({
            tagId: tag.id,
            mangaId: manga.id
        })

        tagToManga.save();
    } catch (e) {
        res.send(e);
    }
})

//доп функции
app.get('getUser', (req, res) => {
    res.json(getUser(req.body.email));
})

async function getUser(email1) {
    return await Users.findOne({ where: { email: email1 } })
}


async function createUser(nick, email, password) {
    const newUser = await Users.create({
        nickname: nick,
        email: email,
        password: password,
        level: 0,
        statusId: 0,
        chaptersReaded: 0,
    });
    await newUser.save();
}