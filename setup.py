from setuptools import setup, find_packages

with open("requirements.txt") as f:
    install_requires = f.read().strip().split("\n")

setup(
    name="warehouse_theatre",
    version="0.0.1",
    description="Theatre-style warehouse storage capacity visualization",
    author="Pranera Services",
    author_email="aravind_g@pss.com",
    packages=find_packages(),
    zip_safe=False,
    include_package_data=True,
    install_requires=install_requires,
)
