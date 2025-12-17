"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "pages/api/v1/auth/login";
exports.ids = ["pages/api/v1/auth/login"];
exports.modules = {

/***/ "cookie":
/*!*************************!*\
  !*** external "cookie" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("cookie");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "next/dist/compiled/next-server/pages-api.runtime.dev.js":
/*!**************************************************************************!*\
  !*** external "next/dist/compiled/next-server/pages-api.runtime.dev.js" ***!
  \**************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/pages-api.runtime.dev.js");

/***/ }),

/***/ "pg":
/*!*********************!*\
  !*** external "pg" ***!
  \*********************/
/***/ ((module) => {

module.exports = require("pg");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = import("bcryptjs");;

/***/ }),

/***/ "(api)/../../node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fv1%2Fauth%2Flogin&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Fv1%2Fauth%2Flogin.js&middlewareConfigBase64=e30%3D!":
/*!**************************************************************************************************************************************************************************************************************************************************!*\
  !*** ../../node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fv1%2Fauth%2Flogin&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Fv1%2Fauth%2Flogin.js&middlewareConfigBase64=e30%3D! ***!
  \**************************************************************************************************************************************************************************************************************************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   routeModule: () => (/* binding */ routeModule)\n/* harmony export */ });\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/server/future/route-modules/pages-api/module.compiled */ \"(api)/../../node_modules/next/dist/server/future/route-modules/pages-api/module.compiled.js\");\n/* harmony import */ var next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/future/route-kind */ \"(api)/../../node_modules/next/dist/server/future/route-kind.js\");\n/* harmony import */ var next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/build/templates/helpers */ \"(api)/../../node_modules/next/dist/build/templates/helpers.js\");\n/* harmony import */ var _src_pages_api_v1_auth_login_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./src/pages/api/v1/auth/login.js */ \"(api)/./src/pages/api/v1/auth/login.js\");\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_src_pages_api_v1_auth_login_js__WEBPACK_IMPORTED_MODULE_3__]);\n_src_pages_api_v1_auth_login_js__WEBPACK_IMPORTED_MODULE_3__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n\n\n\n// Import the userland code.\n\n// Re-export the handler (should be the default export).\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ((0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_src_pages_api_v1_auth_login_js__WEBPACK_IMPORTED_MODULE_3__, \"default\"));\n// Re-export config.\nconst config = (0,next_dist_build_templates_helpers__WEBPACK_IMPORTED_MODULE_2__.hoist)(_src_pages_api_v1_auth_login_js__WEBPACK_IMPORTED_MODULE_3__, \"config\");\n// Create and export the route module that will be consumed.\nconst routeModule = new next_dist_server_future_route_modules_pages_api_module_compiled__WEBPACK_IMPORTED_MODULE_0__.PagesAPIRouteModule({\n    definition: {\n        kind: next_dist_server_future_route_kind__WEBPACK_IMPORTED_MODULE_1__.RouteKind.PAGES_API,\n        page: \"/api/v1/auth/login\",\n        pathname: \"/api/v1/auth/login\",\n        // The following aren't used in production.\n        bundlePath: \"\",\n        filename: \"\"\n    },\n    userland: _src_pages_api_v1_auth_login_js__WEBPACK_IMPORTED_MODULE_3__\n});\n\n//# sourceMappingURL=pages-api.js.map\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi4vLi4vbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1yb3V0ZS1sb2FkZXIvaW5kZXguanM/a2luZD1QQUdFU19BUEkmcGFnZT0lMkZhcGklMkZ2MSUyRmF1dGglMkZsb2dpbiZwcmVmZXJyZWRSZWdpb249JmFic29sdXRlUGFnZVBhdGg9LiUyRnNyYyUyRnBhZ2VzJTJGYXBpJTJGdjElMkZhdXRoJTJGbG9naW4uanMmbWlkZGxld2FyZUNvbmZpZ0Jhc2U2ND1lMzAlM0QhIiwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7O0FBQXNHO0FBQ3ZDO0FBQ0w7QUFDMUQ7QUFDNkQ7QUFDN0Q7QUFDQSxpRUFBZSx3RUFBSyxDQUFDLDREQUFRLFlBQVksRUFBQztBQUMxQztBQUNPLGVBQWUsd0VBQUssQ0FBQyw0REFBUTtBQUNwQztBQUNPLHdCQUF3QixnSEFBbUI7QUFDbEQ7QUFDQSxjQUFjLHlFQUFTO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0wsWUFBWTtBQUNaLENBQUM7O0FBRUQscUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWIvPzQ3ZmMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGFnZXNBUElSb3V0ZU1vZHVsZSB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1tb2R1bGVzL3BhZ2VzLWFwaS9tb2R1bGUuY29tcGlsZWRcIjtcbmltcG9ydCB7IFJvdXRlS2luZCB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL2Z1dHVyZS9yb3V0ZS1raW5kXCI7XG5pbXBvcnQgeyBob2lzdCB9IGZyb20gXCJuZXh0L2Rpc3QvYnVpbGQvdGVtcGxhdGVzL2hlbHBlcnNcIjtcbi8vIEltcG9ydCB0aGUgdXNlcmxhbmQgY29kZS5cbmltcG9ydCAqIGFzIHVzZXJsYW5kIGZyb20gXCIuL3NyYy9wYWdlcy9hcGkvdjEvYXV0aC9sb2dpbi5qc1wiO1xuLy8gUmUtZXhwb3J0IHRoZSBoYW5kbGVyIChzaG91bGQgYmUgdGhlIGRlZmF1bHQgZXhwb3J0KS5cbmV4cG9ydCBkZWZhdWx0IGhvaXN0KHVzZXJsYW5kLCBcImRlZmF1bHRcIik7XG4vLyBSZS1leHBvcnQgY29uZmlnLlxuZXhwb3J0IGNvbnN0IGNvbmZpZyA9IGhvaXN0KHVzZXJsYW5kLCBcImNvbmZpZ1wiKTtcbi8vIENyZWF0ZSBhbmQgZXhwb3J0IHRoZSByb3V0ZSBtb2R1bGUgdGhhdCB3aWxsIGJlIGNvbnN1bWVkLlxuZXhwb3J0IGNvbnN0IHJvdXRlTW9kdWxlID0gbmV3IFBhZ2VzQVBJUm91dGVNb2R1bGUoe1xuICAgIGRlZmluaXRpb246IHtcbiAgICAgICAga2luZDogUm91dGVLaW5kLlBBR0VTX0FQSSxcbiAgICAgICAgcGFnZTogXCIvYXBpL3YxL2F1dGgvbG9naW5cIixcbiAgICAgICAgcGF0aG5hbWU6IFwiL2FwaS92MS9hdXRoL2xvZ2luXCIsXG4gICAgICAgIC8vIFRoZSBmb2xsb3dpbmcgYXJlbid0IHVzZWQgaW4gcHJvZHVjdGlvbi5cbiAgICAgICAgYnVuZGxlUGF0aDogXCJcIixcbiAgICAgICAgZmlsZW5hbWU6IFwiXCJcbiAgICB9LFxuICAgIHVzZXJsYW5kXG59KTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGFnZXMtYXBpLmpzLm1hcCJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/../../node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fv1%2Fauth%2Flogin&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Fv1%2Fauth%2Flogin.js&middlewareConfigBase64=e30%3D!\n");

/***/ }),

/***/ "(api)/./src/pages/api/v1/auth/login.js":
/*!****************************************!*\
  !*** ./src/pages/api/v1/auth/login.js ***!
  \****************************************/
/***/ ((module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {\n__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var pg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pg */ \"pg\");\n/* harmony import */ var pg__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pg__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! bcryptjs */ \"bcryptjs\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! jsonwebtoken */ \"jsonwebtoken\");\n/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(jsonwebtoken__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var cookie__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! cookie */ \"cookie\");\n/* harmony import */ var cookie__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(cookie__WEBPACK_IMPORTED_MODULE_3__);\nvar __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([bcryptjs__WEBPACK_IMPORTED_MODULE_1__]);\nbcryptjs__WEBPACK_IMPORTED_MODULE_1__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];\n// pages/api/v1/auth/login.js\n\n\n\n\nconst pool = new pg__WEBPACK_IMPORTED_MODULE_0__.Pool({\n    connectionString: process.env.DATABASE_URL\n});\nconst JWT_SECRET = process.env.JWT_SECRET || \"dev_secret_change_me\";\nasync function handler(req, res) {\n    if (req.method !== \"POST\") return res.status(405).end();\n    const { email, password } = req.body || {};\n    if (!email || !password) return res.status(400).json({\n        message: \"email и password обязательны\"\n    });\n    try {\n        const { rows } = await pool.query(\"SELECT id, password_hash, first_name, last_name FROM users WHERE email=$1 LIMIT 1\", [\n            email\n        ]);\n        if (!rows[0]) return res.status(401).json({\n            message: \"Неверные данные\"\n        });\n        const ok = await bcryptjs__WEBPACK_IMPORTED_MODULE_1__[\"default\"].compare(password, rows[0].password_hash);\n        if (!ok) return res.status(401).json({\n            message: \"Неверные данные\"\n        });\n        const token = jsonwebtoken__WEBPACK_IMPORTED_MODULE_2___default().sign({\n            sub: rows[0].id\n        }, JWT_SECRET, {\n            expiresIn: \"7d\"\n        });\n        res.setHeader(\"Set-Cookie\", (0,cookie__WEBPACK_IMPORTED_MODULE_3__.serialize)(\"gidkit_token\", token, {\n            httpOnly: true,\n            secure: \"development\" === \"production\",\n            sameSite: \"lax\",\n            path: \"/\",\n            maxAge: 60 * 60 * 24 * 7\n        }));\n        return res.status(200).json({\n            ok: true\n        });\n    } catch (e) {\n        console.error(e);\n        return res.status(500).json({\n            message: \"Server error\"\n        });\n    }\n}\n\n__webpack_async_result__();\n} catch(e) { __webpack_async_result__(e); } });//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwaSkvLi9zcmMvcGFnZXMvYXBpL3YxL2F1dGgvbG9naW4uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBQSw2QkFBNkI7QUFDSDtBQUNJO0FBQ0M7QUFDSTtBQUVuQyxNQUFNSSxPQUFPLElBQUlKLG9DQUFJQSxDQUFDO0lBQUVLLGtCQUFrQkMsUUFBUUMsR0FBRyxDQUFDQyxZQUFZO0FBQUM7QUFDbkUsTUFBTUMsYUFBYUgsUUFBUUMsR0FBRyxDQUFDRSxVQUFVLElBQUk7QUFFOUIsZUFBZUMsUUFBUUMsR0FBRyxFQUFFQyxHQUFHO0lBQzVDLElBQUlELElBQUlFLE1BQU0sS0FBSyxRQUFRLE9BQU9ELElBQUlFLE1BQU0sQ0FBQyxLQUFLQyxHQUFHO0lBRXJELE1BQU0sRUFBRUMsS0FBSyxFQUFFQyxRQUFRLEVBQUUsR0FBR04sSUFBSU8sSUFBSSxJQUFJLENBQUM7SUFDekMsSUFBSSxDQUFDRixTQUFTLENBQUNDLFVBQVUsT0FBT0wsSUFBSUUsTUFBTSxDQUFDLEtBQUtLLElBQUksQ0FBQztRQUFFQyxTQUFTO0lBQStCO0lBRS9GLElBQUk7UUFDRixNQUFNLEVBQUVDLElBQUksRUFBRSxHQUFHLE1BQU1qQixLQUFLa0IsS0FBSyxDQUMvQixxRkFDQTtZQUFDTjtTQUFNO1FBRVQsSUFBSSxDQUFDSyxJQUFJLENBQUMsRUFBRSxFQUFFLE9BQU9ULElBQUlFLE1BQU0sQ0FBQyxLQUFLSyxJQUFJLENBQUM7WUFBRUMsU0FBUztRQUFrQjtRQUV2RSxNQUFNRyxLQUFLLE1BQU10Qix3REFBYyxDQUFDZ0IsVUFBVUksSUFBSSxDQUFDLEVBQUUsQ0FBQ0ksYUFBYTtRQUMvRCxJQUFJLENBQUNGLElBQUksT0FBT1gsSUFBSUUsTUFBTSxDQUFDLEtBQUtLLElBQUksQ0FBQztZQUFFQyxTQUFTO1FBQWtCO1FBRWxFLE1BQU1NLFFBQVF4Qix3REFBUSxDQUFDO1lBQUUwQixLQUFLUCxJQUFJLENBQUMsRUFBRSxDQUFDUSxFQUFFO1FBQUMsR0FBR3BCLFlBQVk7WUFBRXFCLFdBQVc7UUFBSztRQUUxRWxCLElBQUltQixTQUFTLENBQUMsY0FBYzVCLGlEQUFTQSxDQUFDLGdCQUFnQnVCLE9BQU87WUFDM0RNLFVBQVU7WUFDVkMsUUFBUTNCLGtCQUF5QjtZQUNqQzRCLFVBQVU7WUFDVkMsTUFBTTtZQUNOQyxRQUFRLEtBQUssS0FBSyxLQUFLO1FBQ3pCO1FBRUEsT0FBT3hCLElBQUlFLE1BQU0sQ0FBQyxLQUFLSyxJQUFJLENBQUM7WUFBRUksSUFBSTtRQUFLO0lBQ3pDLEVBQUUsT0FBT2MsR0FBRztRQUNWQyxRQUFRQyxLQUFLLENBQUNGO1FBQ2QsT0FBT3pCLElBQUlFLE1BQU0sQ0FBQyxLQUFLSyxJQUFJLENBQUM7WUFBRUMsU0FBUztRQUFlO0lBQ3hEO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly93ZWIvLi9zcmMvcGFnZXMvYXBpL3YxL2F1dGgvbG9naW4uanM/YTM5OSJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBwYWdlcy9hcGkvdjEvYXV0aC9sb2dpbi5qc1xuaW1wb3J0IHsgUG9vbCB9IGZyb20gJ3BnJztcbmltcG9ydCBiY3J5cHQgZnJvbSAnYmNyeXB0anMnO1xuaW1wb3J0IGp3dCBmcm9tICdqc29ud2VidG9rZW4nO1xuaW1wb3J0IHsgc2VyaWFsaXplIH0gZnJvbSAnY29va2llJztcblxuY29uc3QgcG9vbCA9IG5ldyBQb29sKHsgY29ubmVjdGlvblN0cmluZzogcHJvY2Vzcy5lbnYuREFUQUJBU0VfVVJMIH0pO1xuY29uc3QgSldUX1NFQ1JFVCA9IHByb2Nlc3MuZW52LkpXVF9TRUNSRVQgfHwgJ2Rldl9zZWNyZXRfY2hhbmdlX21lJztcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgZnVuY3Rpb24gaGFuZGxlcihyZXEsIHJlcykge1xuICBpZiAocmVxLm1ldGhvZCAhPT0gJ1BPU1QnKSByZXR1cm4gcmVzLnN0YXR1cyg0MDUpLmVuZCgpO1xuXG4gIGNvbnN0IHsgZW1haWwsIHBhc3N3b3JkIH0gPSByZXEuYm9keSB8fCB7fTtcbiAgaWYgKCFlbWFpbCB8fCAhcGFzc3dvcmQpIHJldHVybiByZXMuc3RhdHVzKDQwMCkuanNvbih7IG1lc3NhZ2U6ICdlbWFpbCDQuCBwYXNzd29yZCDQvtCx0Y/Qt9Cw0YLQtdC70YzQvdGLJyB9KTtcblxuICB0cnkge1xuICAgIGNvbnN0IHsgcm93cyB9ID0gYXdhaXQgcG9vbC5xdWVyeShcbiAgICAgICdTRUxFQ1QgaWQsIHBhc3N3b3JkX2hhc2gsIGZpcnN0X25hbWUsIGxhc3RfbmFtZSBGUk9NIHVzZXJzIFdIRVJFIGVtYWlsPSQxIExJTUlUIDEnLFxuICAgICAgW2VtYWlsXVxuICAgICk7XG4gICAgaWYgKCFyb3dzWzBdKSByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBtZXNzYWdlOiAn0J3QtdCy0LXRgNC90YvQtSDQtNCw0L3QvdGL0LUnIH0pO1xuXG4gICAgY29uc3Qgb2sgPSBhd2FpdCBiY3J5cHQuY29tcGFyZShwYXNzd29yZCwgcm93c1swXS5wYXNzd29yZF9oYXNoKTtcbiAgICBpZiAoIW9rKSByZXR1cm4gcmVzLnN0YXR1cyg0MDEpLmpzb24oeyBtZXNzYWdlOiAn0J3QtdCy0LXRgNC90YvQtSDQtNCw0L3QvdGL0LUnIH0pO1xuXG4gICAgY29uc3QgdG9rZW4gPSBqd3Quc2lnbih7IHN1Yjogcm93c1swXS5pZCB9LCBKV1RfU0VDUkVULCB7IGV4cGlyZXNJbjogJzdkJyB9KTtcblxuICAgIHJlcy5zZXRIZWFkZXIoJ1NldC1Db29raWUnLCBzZXJpYWxpemUoJ2dpZGtpdF90b2tlbicsIHRva2VuLCB7XG4gICAgICBodHRwT25seTogdHJ1ZSxcbiAgICAgIHNlY3VyZTogcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPT09ICdwcm9kdWN0aW9uJyxcbiAgICAgIHNhbWVTaXRlOiAnbGF4JyxcbiAgICAgIHBhdGg6ICcvJyxcbiAgICAgIG1heEFnZTogNjAgKiA2MCAqIDI0ICogNyxcbiAgICB9KSk7XG5cbiAgICByZXR1cm4gcmVzLnN0YXR1cygyMDApLmpzb24oeyBvazogdHJ1ZSB9KTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgcmV0dXJuIHJlcy5zdGF0dXMoNTAwKS5qc29uKHsgbWVzc2FnZTogJ1NlcnZlciBlcnJvcicgfSk7XG4gIH1cbn1cbiJdLCJuYW1lcyI6WyJQb29sIiwiYmNyeXB0Iiwiand0Iiwic2VyaWFsaXplIiwicG9vbCIsImNvbm5lY3Rpb25TdHJpbmciLCJwcm9jZXNzIiwiZW52IiwiREFUQUJBU0VfVVJMIiwiSldUX1NFQ1JFVCIsImhhbmRsZXIiLCJyZXEiLCJyZXMiLCJtZXRob2QiLCJzdGF0dXMiLCJlbmQiLCJlbWFpbCIsInBhc3N3b3JkIiwiYm9keSIsImpzb24iLCJtZXNzYWdlIiwicm93cyIsInF1ZXJ5Iiwib2siLCJjb21wYXJlIiwicGFzc3dvcmRfaGFzaCIsInRva2VuIiwic2lnbiIsInN1YiIsImlkIiwiZXhwaXJlc0luIiwic2V0SGVhZGVyIiwiaHR0cE9ubHkiLCJzZWN1cmUiLCJzYW1lU2l0ZSIsInBhdGgiLCJtYXhBZ2UiLCJlIiwiY29uc29sZSIsImVycm9yIl0sInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///(api)/./src/pages/api/v1/auth/login.js\n");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../../webpack-api-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next"], () => (__webpack_exec__("(api)/../../node_modules/next/dist/build/webpack/loaders/next-route-loader/index.js?kind=PAGES_API&page=%2Fapi%2Fv1%2Fauth%2Flogin&preferredRegion=&absolutePagePath=.%2Fsrc%2Fpages%2Fapi%2Fv1%2Fauth%2Flogin.js&middlewareConfigBase64=e30%3D!")));
module.exports = __webpack_exports__;

})();