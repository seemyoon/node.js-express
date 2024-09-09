"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidators = void 0;
const joi_1 = __importDefault(require("joi"));
class UserValidators {
}
exports.UserValidators = UserValidators;
_a = UserValidators;
UserValidators.email = joi_1.default.string()
    .min(2)
    .max(30)
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/);
UserValidators.userName = joi_1.default.string()
    .min(2)
    .max(30);
UserValidators.password = joi_1.default.string()
    .min(6)
    .max(30)
    .regex(/^[a-zA-Z0-9_@$!%*?&#]+$/);
UserValidators.createUser = joi_1.default.object({
    email: _a.email.required(),
    name: _a.userName.required(),
    password: _a.password.required()
});
