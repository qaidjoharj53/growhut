// user signup controller with json file db
import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const dbPath = path.join(__dirname, "../db/users.json");

export const signup = (req, res) => {
	const { username, email, password } = req.body;
	if (!username || !email || !password) {
		return res.status(400).json({ message: "All fields are required" });
	}

	// validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({ message: "Invalid email format" });
	}

	// validate password length
	if (password.length < 6) {
		return res
			.status(400)
			.json({ message: "Password must be at least 6 characters long" });
	}

	// hash the password using bcrypt
	const saltRounds = 10;
	bcrypt.hash(password, saltRounds, (err, hash) => {
		if (err) {
			return res.status(500).json({ message: "Error hashing password" });
		}

		// read the existing users from the JSON file
		fs.readFile(dbPath, "utf8", (err, data) => {
			if (err) {
				return res
					.status(500)
					.json({ message: "Error reading database" });
			}

			let users = [];
			if (data) {
				users = JSON.parse(data);
			}

			// check if the user already exists
			const userExists = users.find((user) => user.email === email);
			if (userExists) {
				return res.status(400).json({ message: "User already exists" });
			} else if (users.find((user) => user.username === username)) {
				return res
					.status(400)
					.json({ message: "Username already exists" });
			}

			// create a new user object
			const newUser = {
				userId: randomUUID,
				username,
				email,
				password: hash,
			};

			// add the new user to the users array
			users.push(newUser);

			// write the updated users array back to the JSON file
			fs.writeFile(dbPath, JSON.stringify(users, null, 2), (err) => {
				if (err) {
					return res
						.status(500)
						.json({ message: "Error saving user" });
				}
				res.status(201).json({
					userId: newUser.userId,
					message: "User created successfully",
				});
			});
		});
	});
};
