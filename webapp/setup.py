from app import create_app

application = create_app()

if "__main__" == __name__:
    application.run(host='0.0.0.0')