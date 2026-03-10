import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const UseCasesSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const useCases = [
    {
      emoji: "🏙️",
      title: "Қала Мониторингі",
      desc: "Қалалардың экологиялық сапасын нақты уақытта мониторингі",
      details: [
        "Ауа ластану деңгейін мониторингі",
        "Жасыл аймақ анализі",
        "Климат параметрлері",
        "Түнуінің карточкаларындағы модель",
      ],
    },
    {
      emoji: "🌡️",
      title: "Климат Анализі",
      desc: "Климаттық өзгерістерді ізделіп, болжалау",
      details: [
        "Температура және ынамдоқтүлік деректері",
        "CO₂ деңгейінің өндік",
        "Озон және ластану дәңгейі",
        "Түстері болжалау модельлері",
      ],
    },
    {
      emoji: "🌱",
      title: "Тұрақтылық Жоспарлау",
      desc: "Компаниялар үшін экологиялық жоспарлау",
      details: [
        "Карбон сызығы өндік",
        "ESG мақсаттарының бәлімі",
        "Экологиялық іс-әрекеттер ұлғаю",
        "Тұрақтылық рәсімдері",
      ],
    },
    {
      emoji: "🔬",
      title: "Ғылыми Институтлар",
      desc: "Климат және экология ғылымына деректер",
      details: [
        "Ашық деректер пайдалану",
        "Зерттеу түндігін құру",
        "Ғалымдар біліктіліктері",
        "Гранттар және қаржыларындағы шартар",
      ],
    },
    {
      emoji: "📋",
      title: "Экологиялық Саясат",
      desc: "Үкіметтер үшін саясат құру және контроль",
      details: [
        "Қала берпесінің ластану мониторингі",
        "Климат саясатының әсері",
        "Экологиялық өндіктік құрмет",
        "Орындықтағы білік берсін",
      ],
    },
    {
      emoji: "🚀",
      title: "GreenTech Стартапты",
      desc: "Экологиялық шешімдер құру үшін деректер",
      details: [
        "Экологиялық трендтерін ізделіп",
        "Таңдау балмасындағы рәсімдер",
        "Өндік-балмасындағы құру",
        "Инновациялық рәсімдері",
      ],
    },
  ];

  return (
    <section id="use-cases" className="relative py-24 px-4" ref={ref}>
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-widest text-secondary mb-3 font-mono-data">
            Пайдалану салалары
          </p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold text-foreground mb-6">
            GreenPulse <span className="text-gradient">Қолдану</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Әрқайсысының салалар өндіктік өндіс піс екендеуінің қолдану қондыра алады.
            Қалалар, компаниялар, ғалымдар және саясатты құралықтарының қаршысындағы шешімдеріне
            GreenPulse қолданады.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, i) => (
            <motion.div
              key={useCase.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="glass rounded-xl p-6 neon-border hover:scale-105 transition-transform duration-300"
            >
              <div className="text-5xl mb-4">{useCase.emoji}</div>
              <h3 className="font-headline text-lg font-bold text-foreground mb-2">{useCase.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{useCase.desc}</p>
              <ul className="space-y-2">
                {useCase.details.map((detail) => (
                  <li key={detail} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 flex-shrink-0" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 glass rounded-xl p-8 neon-border"
        >
          <h3 className="font-headline text-2xl font-bold text-foreground mb-6 text-center">
            Деректерді Пайдалану
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-headline font-bold text-foreground mb-3">Кайтадан Үндіңіздің</h4>
              <p className="text-sm text-muted-foreground">
                GreenPulse деректеріне бәлімді өндіс түндіктіліктерінің, науктарының
                және экологиялық шешімдерінің құру үшін пайдалануға мүмкіндік береміз.
              </p>
            </div>
            <div>
              <h4 className="font-headline font-bold text-foreground mb-3">Интеграция</h4>
              <p className="text-sm text-muted-foreground">
                RESTful API арқылы ұйымдарының өзін система өндіктік өндіс піс рәсімдеріне
                ынамдалған өндіктік интеграция жүргіздің болады.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UseCasesSection;
