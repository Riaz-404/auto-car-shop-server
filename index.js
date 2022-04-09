const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const fileUpload = require('express-fileupload');
const ObjectID = require('mongodb').ObjectID;

require('dotenv').config();

const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.phfwz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();

        const database = client.db('auto-car-shop');
        const carCollection = database.collection('cars');
        const usersCollection = database.collection('users');
        const cartCollection = database.collection('cart');
        const reviewCollection = database.collection('review');

        app.get('/cars', async (req, res) => {
            const cursors = carCollection.find({});
            const cars = await cursors.toArray();
            res.send(cars);
        });

        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await carCollection.findOne(query);
            res.send(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email };

            const user = await usersCollection.find(query);
            const result = await user.toArray();
            res.send(result);
        });

        app.get('/cart', async (req, res) => {
            const cursors = cartCollection.find({});
            const cars = await cursors.toArray();
            res.send(cars);
        });

        app.get('/cart/product/:email', async (req, res) => {
            const email = req.params.email;

            const query = { userEmail: email };

            const user = await cartCollection.find(query);
            const result = await user.toArray();
            res.send(result);
        });

        app.get('/cart/q', async (req, res) => {
            const email = req.query.email;
            const status = req.query.status;
            const query = { userEmail: email, status: status };
            const product = await cartCollection.find(query);
            const result = await product.toArray();
            res.send(result);
        });

        app.get('/review', async (req, res) => {
            const cursors = reviewCollection.find({});
            const cars = await cursors.toArray();
            res.send(cars);
        });


        app.get('/review/q', async (req, res) => {
            const id = req.query.carId;
            const query = { carId: id };
            const product = await reviewCollection.find(query);
            const result = await product.toArray();
            res.send(result);
        });



        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;

            const query = { email: email };

            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'Admin') {
                isAdmin = true;
            }
            res.send({ 'Admin': isAdmin });
        });

        app.get('/users', async (req, res) => {
            const cursor = usersCollection.find({});
            const users = await cursor.toArray();
            res.send(users);
        });



        app.post('/cars', async (req, res) => {
            const name = req.body.name;
            const price = req.body.price;
            const fuelTypes = req.body.fuelTypes;
            const deliveryTime = req.body.deliveryTime;
            const description = req.body.description;

            const img = req.files.image;
            const imgData = img.data;
            const encodedImg = imgData.toString('base64');
            const imgName = Buffer.from(encodedImg, 'base64');

            const car = {
                name: name,
                price: price,
                fuelTypes: fuelTypes,
                deliveryTime: deliveryTime,
                image: imgName,
                description: description
            }
            const result = await carCollection.insertOne(car);
            res.send(result);
        });

        app.post('/users', async (req, res) => {
            const displayName = req.body.displayName;
            const email = req.body.email;

            const user = {
                displayName: displayName,
                email: email
            }
            const findResult = await usersCollection.findOne({ email: email });
            if (!findResult) {
                const result = await usersCollection.insertOne(user);
                res.json(result);
            } else {
                res.status(400).send('User with this email already exists');
            }
        });

        app.post('/cart', async (req, res) => {
            const userEmail = req.body.email;
            const carId = req.body.id;
            const carName = req.body.name;
            const carColor = req.body.color;
            const carPrice = req.body.price;
            const deliveryDate = req.body.deliveryDate;
            const status = req.body.status;

            const list = {
                userEmail: userEmail,
                carId: carId,
                carName: carName,
                carColor: carColor,
                carPrice: carPrice,
                deliveryDate: deliveryDate,
                status: status
            }

            const result = await cartCollection.insertOne(list);
            res.send(result);
        });

        app.post('/review', async (req, res) => {
            const name = req.body.name;
            const carId = req.body.carId;
            const price = req.body.price;
            const userEmail = req.body.userEmail;
            const userName = req.body.userName;
            const userPhotoUrl = req.body.userPhotoUrl;
            const reviewStar = req.body.reviewStar;
            const review = req.body.review;

            const car = {
                name: name,
                carId: carId,
                price: price,
                userEmail: userEmail,
                userName: userName,
                userPhotoUrl: userPhotoUrl,
                reviewStar: reviewStar,
                review: review
            }
            const result = await reviewCollection.insertOne(car);
            res.send(result);
        });

        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const updateDoc = {
                $set: {
                    role: 'Admin'
                }
            };
            const result = await usersCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        app.put('/cart/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const updateDoc = {
                $set: {
                    status: 'delivered'
                }
            };
            const result = await cartCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        app.put('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const name = req.body.name;
            const price = req.body.price;
            const fuelTypes = req.body.fuelTypes;
            const deliveryTime = req.body.deliveryTime;
            const description = req.body.description;

            const img = req.files?.image;
            let imgName;
            if (img) {
                const imgData = img.data;
                const encodedImg = imgData.toString('base64');
                imgName = Buffer.from(encodedImg, 'base64');
            }

            const updateCar = {
                $set: {
                        name: name,
                        price: price,
                        fuelTypes: fuelTypes,
                        deliveryTime: deliveryTime,
                        if(img) { image: imgName },
                        description: description
                    }
            }
            const result = await carCollection.updateOne(query, updateCar);
            res.send(result);
        });

        app.delete('/cart/remove/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await cartCollection.deleteOne(query);
            res.send(result);
        })

        app.delete('/cars/remove/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await carCollection.deleteOne(query);
            res.send(result);
        })

    } catch (err) {
        console.error(err);
    } finally {

    }
}

run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Welcome to Auto Car Shop!!!');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});