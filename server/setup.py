from app import create_app

application = create_app()

if "__main__" == __name__:
    application.run(host='localhost', port=5050)