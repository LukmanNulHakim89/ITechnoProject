function Login() {
    return (
        <div className="login-page">

            {/* LEFT PANEL */}
            <div className="left-panel">

                <img
                    src="/images/auth/poster.png"
                    alt="Nexora Business Intelligence"
                    className="poster-image"
                />

            </div>


            {/* RIGHT PANEL */}
            <div className="right-panel">

                <div className="login-box">

                    <h2>Welcome!</h2>

                    <p>
                        Enter your credential to continue
                    </p>


                    <input
                        type="text"
                        placeholder="Email / Username"
                    />


                    <input
                        type="password"
                        placeholder="Password"
                    />


                    <div className="login-options">

                        <label>
                            <input type="checkbox" />
                            Remember me
                        </label>

                        <a href="#">
                            Forgot password?
                        </a>

                    </div>


                    <button className="primary-btn">
                        Login
                    </button>


                    <button className="google-btn">
                        Continue with Google
                    </button>


                    <p className="signup">
                        Don't have an account?
                        <a href="#">
                            {" "}Create account
                        </a>
                    </p>

                </div>

            </div>

        </div>
    );
}

export default Login;