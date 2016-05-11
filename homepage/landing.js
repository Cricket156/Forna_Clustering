.hero {
  background-color: #ccc;
  max-height: 48rem;
  overflow: hidden;
  width: 100vw;
}

.hero img {
  -webkit-filter: brightness(25%);
  filter: brightness(25%);
  height: 90rem;
  transform: translateY(-35%);
  width: 100vw;
}

@media screen and (max-width: 1200px) {
  img { height: 90rem; }
}

@media screen and (max-width: 1024px) {
  img { height: 50rem; }
}

@media screen and (max-width: 640px) {
  img { height: 30rem; }
}

.hero figure {
  margin: 0;
  max-height: 48rem;
  padding: 0;
  position: relative;
  text-align: center;
  width: 100%;
  // z-index: -10;
}

.hero figcaption {
  display: -webkit-flex;
  display: flex;
  -webkit-flex-flow: column wrap;
	flex-flow: column wrap;
  -webkit-justify-content: center;
  justify-content: center;
  height: 100%;
  left: 0;
  margin-top: 3rem;
  position: absolute;
  top: 0;
  width: 100%
}

.hero h1 {
  color: #f2f2f2;
}

.hero h2 {
  color: #f2f2f2;
  margin-bottom: 2.5rem;
}

.hero h6 {
  margin-top: 5rem;
}

.hero a:not(.cta) {
  color: $light-gray;
}

.hero span {
  border-bottom: 1px solid $white;
  padding-bottom: 3px;
}

@media screen and (max-width: 1200px) {
  /*.hero {
    img {
      transform: translateY(-35%);
    }
  }*/
}

@media screen and (max-width: 1024px) {
  /*.hero {
    img {
      transform: translateY(-10%);
    }
  }*/
}

@media screen and (max-width: 640px) {
  /*.hero {
    img {
      transform: translateY(0);
    }
  }*/
}
