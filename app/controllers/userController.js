const { User } = require('../models');
const validator = require('validator');
const bcrypt = require('bcrypt')

const userController = {
    getAllUsers: async (request, response) => {
        try {
            const users = await User.findAll();
            response.status(200).json(users);
        }
        
        catch (error) {
            console.trace(error);
            response.status(500).json(error);
        }
    },

    getOneUser: async (request, response) => {
        try {
            // On parse l'id reçu en un nombre entier
            const userId = parseInt(request.params.id, 10);
    
            // On vérifie que l'id est bien de type number
            if (isNaN(userId)) {
                response.status(400).json('L\id spécifié doit être de type number');
                return;
            }

            const user = await User.findByPk(userId, {
                include: ['tables', 'lists', 'cards', 'tags']
            });

            response.status(200).json(user);
        }

        catch (error) {
            console.trace(error);
            response.status(404).json(`L'utilisateur avec l'id ${userId} n'existe pas`);
        }
    },

    createUser: async (request, response) => {
        try {
            // On déstructure le formulaire reçu
            const { first_name, last_name, email, password } = request.body;

            // On initialise un tableau d'erreurs
            const bodyErrors = [];

            // On vérifie que les champs ne sont pas vides
            if (!first_name) {
                bodyErrors.push('Le champ prénom ne peut être vide');
            }
            
            if (!last_name) {
                bodyErrors.push('Le champ nom ne peut être vide');
            }

            if (!email) {
                bodyErrors.push('Le champ email ne peut être vide');
            }

            if (!password) {
                bodyErrors.push('Le champ mot de passe ne peut être vide');
            }

            // On vérifie que les champs first_name et last_name ne contiennent que des lettres
            if (first_name) {
                if (!validator.isAlpha(first_name)) {
                    bodyErrors.push('Le champ prénom ne doit contenir que des lettres');
                }                
            }

            if (last_name) {
                if (!validator.isAlpha(last_name)) {
                    bodyErrors.push('Le champ nom ne doit contenir que des lettres');
                }
            }

            // On vérifie que l'email est valide
            if (email) {
                if (!validator.isEmail(email)) {
                    bodyErrors.push('Le champ email doit être valide');
                }                
            }

            // On envoie le tableau en cas d'erreurs
            if (bodyErrors.length) {
                response.status(400).json(bodyErrors);
                return;
            }
            
            // On vérifie que l'email n'est pas déjà utilisé par un autre utilisateur
            const foundUser = await User.findOne({
                where: {
                    email: email
                }
            });

            if (foundUser) {
                response.status(409).json('Cet email est déjà utilisé par un utilisateur');
                return;
            }

            // On crypte le mot de passe reçu avant mise en BDD
            const salt = await bcrypt.genSalt(10);
            const encryptedPassword = await bcrypt.hash(email, salt);

            // On crée le nouvel utilisateur
            const newUser = await User.create({
                first_name,
                last_name,
                email,
                password: encryptedPassword
            });

            response.status(201).json(newUser);
        }

        catch (error) {
            console.trace(error);
            response.status(500).json(error);
        }
    },

    updateOneUser: async (request, response) => {
        try {
            // On parse l'id reçu en un nombre entier
            const userId = parseInt(request.params.id, 10);

            // On vérifie que l'id est bien de type number
            if (isNaN(userId)) {
                response.status(400).json('L\'id spécifié doit être de type number');
                return;
            }

            const user = await User.findByPk(userId);
            if (!user) {
                response.status(404).json(`L'utilisateur avec l'id ${userId} n'existe pas`);
                return;
            }

            // On déstructure le formulaire reçu
            const { first_name, last_name, email, password } = request.body;

            // On initialise le tableau d'erreurs
            const bodyErrors = [];

            // On vérifie que les champs first_name et last_name ne contiennent que des lettres
            if (first_name) {
                if (!validator.isAlpha(first_name)) {
                    bodyErrors.push('Le champ prénom ne doit contenir que des lettres');
                }                
            }

            if (last_name) {
                if (!validator.isAlpha(last_name)) {
                    bodyErrors.push('Le champ nom ne doit contenir que des lettres');
                }
            }

            // On vérifie que l'email est valide
            if (email) {
                if (!validator.isEmail(email)) {
                    bodyErrors.push('Le champ email doit être valide');
                }                
            }

            // On envoie le tableau en cas d'erreurs
            if (bodyErrors.length) {
                response.status(400).json(bodyErrors);
                return;
            }
            
            // On vérifie que l'email n'est pas déjà utilisé par un autre utilisateur
            if (email) {
                const foundUser = await User.findOne({
                    where: {
                        email: email
                    }
                });

                if (foundUser) {
                    response.status(409).json('Cet email est déjà utilisé par un utilisateur');
                    return;
                }
            }

            // On update les paramètres reçus
            if (first_name) {
                user.first_name = first_name;
            }

            if (last_name) {
                user.last_name = last_name;
            }

            if (email) {
                user.email = email;
            }

            if (password) {
                // On crypte le mot de passe reçu avant mise en BDD
                const salt = await bcrypt.genSalt(10);
                const encryptedPassword = await bcrypt.hash(email, salt);
                user.password = encryptedPassword;
            }

            // On enregistre les nouvelles données
            await user.save();

            response.status(200).json(user);
        }

        catch (error) {
            console.trace(error);
            response.status(500).json(error);
        }
    }
};

module.exports = userController;