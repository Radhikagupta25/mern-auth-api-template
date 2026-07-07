import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MERN Auth API Template",
            version: "1.0.0",
            description:
                "Production-ready Authentication API built with Express, MongoDB, JWT, Google OAuth, Cloudinary and Nodemailer.",
            contact: {
                name: "Radhika Gupta",
                url: "https://radhika-gupta-portfolio.vercel.app/",
            },
        },

        servers: [
            {
                url: `http://localhost:${process.env.PORT}/api/auth/users`,
                description: "Development Server",
            },
        ],

        tags: [
            {
                name: "Authentication",
                description: "Authentication related APIs",
            },
            {
                name: "User",
                description: "User profile APIs",
            },
            {
                name: "Password Recovery",
                description: "Forgot & Reset Password",
            },
            {
                name: "OAuth",
                description: "Google Authentication",
            },
        ],

        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
    },

    apis: ["./src/routes/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi };