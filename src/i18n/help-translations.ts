/**
 * Help content translations for the Employee Management System
 * This file contains detailed help content and tour information
 */

// English help translations
export const enHelpTranslations = {
  dashboard: {
    overview: {
      title: 'Dashboard Overview',
      content: 'The dashboard gives you a quick overview of your organization with key metrics and recent activity.',
      tip1: 'Check this page regularly to stay updated on your organization.',
      tip2: 'Hover over charts to see detailed information.'
    },
    stats: {
      title: 'Statistics Cards',
      content: 'These cards show the total number of employees, departments, and positions in your organization.',
      tip1: 'Click "View All" to see the complete list.',
      tip2: 'The numbers update automatically as you add or remove items.'
    },
    chart: {
      title: 'Department Distribution',
      content: 'This chart visualizes how your employees are distributed across departments.',
      tip1: 'Hover over sections to see the exact employee count and percentage.',
      tip2: 'A well-balanced organization typically has appropriate staffing across departments.'
    },
    recentHires: {
      title: 'Recent Hires',
      content: 'This section shows your most recently added employees, helping you keep track of new team members.',
      tip1: 'Click on an employee to see their full profile.',
      tip2: 'Use this to quickly check which departments are actively hiring.'
    },
    aiInsights: {
      title: 'AI-Powered Insights',
      content: 'Machine learning algorithms analyze your employee data to provide actionable insights about turnover risk, performance patterns, and organizational health.',
      tip1: 'Expand each insight card to see detailed analysis and recommendations.',
      tip2: 'AI insights are calculated using local processing - your data never leaves your device.'
    }
  },
  employees: {
    list: {
      title: 'Employee List',
      content: 'This page displays all employees in your organization. You can sort, filter, and manage employees from here.',
      step1: 'Use the search box to find specific employees.',
      step2: 'Click the column headers to sort the list.',
      step3: 'Use the filter button to filter by department or position.'
    },
    add: {
      title: 'Adding Employees',
      content: 'Adding new employees is easy with our step-by-step form.',
      step1: 'Click the "Add Employee" button.',
      step2: 'Fill out the required information.',
      step3: 'Select a department and position.',
      step4: 'Click "Save" to add the employee to your organization.'
    }
  },
  departments: {
    list: {
      title: 'Department Management',
      content: 'Departments help you organize your company structure and group employees by function.',
      tip1: 'Create departments before adding positions and employees.',
      tip2: 'Department names should be clear and descriptive.'
    }
  },
  positions: {
    list: {
      title: 'Position Management',
      content: 'Positions define the roles within each department. You must create positions before assigning employees to them.',
      tip1: 'Each position belongs to a specific department.',
      tip2: 'Create a variety of positions to reflect your organization structure.'
    }
  },
  reports: {
    overview: {
      title: 'Reports Overview',
      content: 'Reports provide insights into your workforce and organization structure. Generate reports to analyze data and make informed decisions.',
      step1: 'Select a report type from the dropdown.',
      step2: 'Configure any filters or parameters.',
      step3: 'Click "Generate Report" to view the results.',
      step4: 'Use the export options to save reports in different formats.'
    }
  },
  settings: {
    general: {
      title: 'General Settings',
      content: 'Configure your application preferences, including language, theme, and notification settings.',
      tip1: 'Switch to dark mode for reduced eye strain in low-light environments.',
      tip2: 'Choose the language that works best for your team.'
    },
    account: {
      title: 'Account Settings',
      content: 'Manage your user account, including your profile information and security settings.',
      step1: 'Update your profile information to keep it current.',
      step2: 'Change your password regularly for better security.',
      step3: 'Configure your notification preferences.'
    }
  },
  navigation: {
    sidebar: {
      title: 'Navigation Menu',
      content: 'The sidebar menu gives you quick access to all parts of the application.',
      tip1: 'Click on any menu item to navigate to that section.',
      tip2: 'You can collapse the sidebar on smaller screens by clicking the menu icon.'
    }
  }
};

// French help translations
export const frHelpTranslations = {
  dashboard: {
    overview: {
      title: 'Aperçu du Tableau de Bord',
      content: 'Le tableau de bord vous donne un aperçu rapide de votre organisation avec des métriques clés et des activités récentes.',
      tip1: 'Consultez cette page régulièrement pour rester informé sur votre organisation.',
      tip2: 'Survolez les graphiques pour voir des informations détaillées.'
    },
    stats: {
      title: 'Cartes de Statistiques',
      content: 'Ces cartes montrent le nombre total d\'employés, de départements et de postes dans votre organisation.',
      tip1: 'Cliquez sur "Voir tout" pour voir la liste complète.',
      tip2: 'Les chiffres se mettent à jour automatiquement lorsque vous ajoutez ou supprimez des éléments.'
    },
    chart: {
      title: 'Distribution par Département',
      content: 'Ce graphique visualise comment vos employés sont répartis entre les différents départements.',
      tip1: 'Survolez les sections pour voir le nombre exact d\'employés et le pourcentage.',
      tip2: 'Une organisation bien équilibrée a généralement une répartition appropriée du personnel entre les départements.'
    },
    recentHires: {
      title: 'Recrutements Récents',
      content: 'Cette section montre vos employés les plus récemment ajoutés, vous aidant à suivre les nouveaux membres de l\'équipe.',
      tip1: 'Cliquez sur un employé pour voir son profil complet.',
      tip2: 'Utilisez ceci pour vérifier rapidement quels départements recrutent activement.'
    },
    aiInsights: {
      title: 'Analyses Alimentées par l\'IA',
      content: 'Les algorithmes d\'apprentissage automatique analysent les données de vos employés pour fournir des informations exploitables sur les risques de rotation, les modèles de performance et la santé organisationnelle.',
      tip1: 'Développez chaque carte d\'analyse pour voir des analyses détaillées et des recommandations.',
      tip2: 'Les analyses d\'IA sont calculées à l\'aide d\'un traitement local - vos données ne quittent jamais votre appareil.'
    }
  },
  employees: {
    list: {
      title: 'Liste des Employés',
      content: 'Cette page affiche tous les employés de votre organisation. Vous pouvez trier, filtrer et gérer les employés à partir d\'ici.',
      step1: 'Utilisez la barre de recherche pour trouver des employés spécifiques.',
      step2: 'Cliquez sur les en-têtes de colonne pour trier la liste.',
      step3: 'Utilisez le bouton de filtre pour filtrer par département ou poste.'
    },
    add: {
      title: 'Ajout d\'Employés',
      content: 'L\'ajout de nouveaux employés est facile avec notre formulaire étape par étape.',
      step1: 'Cliquez sur le bouton "Ajouter un employé".',
      step2: 'Remplissez les informations requises.',
      step3: 'Sélectionnez un département et un poste.',
      step4: 'Cliquez sur "Enregistrer" pour ajouter l\'employé à votre organisation.'
    }
  },
  departments: {
    list: {
      title: 'Gestion des Départements',
      content: 'Les départements vous aident à organiser la structure de votre entreprise et à regrouper les employés par fonction.',
      tip1: 'Créez des départements avant d\'ajouter des postes et des employés.',
      tip2: 'Les noms des départements doivent être clairs et descriptifs.'
    }
  },
  positions: {
    list: {
      title: 'Gestion des Postes',
      content: 'Les postes définissent les rôles au sein de chaque département. Vous devez créer des postes avant d\'y affecter des employés.',
      tip1: 'Chaque poste appartient à un département spécifique.',
      tip2: 'Créez une variété de postes pour refléter la structure de votre organisation.'
    }
  },
  reports: {
    overview: {
      title: 'Aperçu des Rapports',
      content: 'Les rapports fournissent des informations sur votre personnel et la structure de votre organisation. Générez des rapports pour analyser les données et prendre des décisions éclairées.',
      step1: 'Sélectionnez un type de rapport dans le menu déroulant.',
      step2: 'Configurez les filtres ou paramètres.',
      step3: 'Cliquez sur "Générer un rapport" pour voir les résultats.',
      step4: 'Utilisez les options d\'exportation pour enregistrer les rapports dans différents formats.'
    }
  },
  settings: {
    general: {
      title: 'Paramètres Généraux',
      content: 'Configurez vos préférences d\'application, y compris la langue, le thème et les paramètres de notification.',
      tip1: 'Passez en mode sombre pour réduire la fatigue oculaire dans les environnements peu éclairés.',
      tip2: 'Choisissez la langue qui convient le mieux à votre équipe.'
    },
    account: {
      title: 'Paramètres du Compte',
      content: 'Gérez votre compte utilisateur, y compris vos informations de profil et vos paramètres de sécurité.',
      step1: 'Mettez à jour les informations de votre profil pour les garder à jour.',
      step2: 'Changez votre mot de passe régulièrement pour une meilleure sécurité.',
      step3: 'Configurez vos préférences de notification.'
    }
  },
  navigation: {
    sidebar: {
      title: 'Menu de Navigation',
      content: 'Le menu latéral vous donne un accès rapide à toutes les parties de l\'application.',
      tip1: 'Cliquez sur n\'importe quel élément du menu pour naviguer vers cette section.',
      tip2: 'Vous pouvez réduire la barre latérale sur les écrans plus petits en cliquant sur l\'icône de menu.'
    }
  }
};

// Arabic help translations
export const arHelpTranslations = {
  dashboard: {
    overview: {
      title: 'نظرة عامة على لوحة التحكم',
      content: 'توفر لوحة التحكم نظرة سريعة على مؤسستك مع مقاييس رئيسية والنشاط الأخير.',
      tip1: 'تحقق من هذه الصفحة بانتظام للبقاء على اطلاع حول مؤسستك.',
      tip2: 'حرك المؤشر فوق الرسوم البيانية لرؤية معلومات مفصلة.'
    },
    stats: {
      title: 'بطاقات الإحصائيات',
      content: 'تعرض هذه البطاقات العدد الإجمالي للموظفين والأقسام والمناصب في مؤسستك.',
      tip1: 'انقر على "عرض الكل" لرؤية القائمة الكاملة.',
      tip2: 'تتحدث الأرقام تلقائيًا عند إضافة أو إزالة العناصر.'
    },
    chart: {
      title: 'توزيع الأقسام',
      content: 'يوضح هذا الرسم البياني كيفية توزيع موظفيك عبر الأقسام المختلفة.',
      tip1: 'حرك المؤشر فوق الأقسام لرؤية العدد الدقيق للموظفين والنسبة المئوية.',
      tip2: 'المؤسسة المتوازنة عادة ما يكون لديها توزيع مناسب للموظفين عبر الأقسام.'
    },
    recentHires: {
      title: 'التعيينات الحديثة',
      content: 'يعرض هذا القسم الموظفين المضافين حديثًا، مما يساعدك على متابعة أعضاء الفريق الجدد.',
      tip1: 'انقر على موظف لرؤية ملفه الشخصي الكامل.',
      tip2: 'استخدم هذا للتحقق بسرعة من الأقسام التي تقوم بالتوظيف بنشاط.'
    },
    aiInsights: {
      title: 'التحليلات المدعومة بالذكاء الاصطناعي',
      content: 'تقوم خوارزميات التعلم الآلي بتحليل بيانات الموظفين لتقديم رؤى قابلة للتنفيذ حول مخاطر ترك العمل وأنماط الأداء وصحة المؤسسة.',
      tip1: 'وسّع كل بطاقة تحليل لرؤية تحليلات مفصلة وتوصيات.',
      tip2: 'يتم حساب تحليلات الذكاء الاصطناعي باستخدام المعالجة المحلية - بياناتك لا تغادر جهازك أبدًا.'
    }
  },
  employees: {
    list: {
      title: 'قائمة الموظفين',
      content: 'تعرض هذه الصفحة جميع الموظفين في مؤسستك. يمكنك فرز وتصفية وإدارة الموظفين من هنا.',
      step1: 'استخدم مربع البحث للعثور على موظفين محددين.',
      step2: 'انقر على رؤوس الأعمدة لفرز القائمة.',
      step3: 'استخدم زر التصفية للتصفية حسب القسم أو المنصب.'
    },
    add: {
      title: 'إضافة موظفين',
      content: 'إضافة موظفين جدد سهلة مع نموذجنا خطوة بخطوة.',
      step1: 'انقر على زر "إضافة موظف".',
      step2: 'املأ المعلومات المطلوبة.',
      step3: 'حدد قسمًا ومنصبًا.',
      step4: 'انقر على "حفظ" لإضافة الموظف إلى مؤسستك.'
    }
  },
  departments: {
    list: {
      title: 'إدارة الأقسام',
      content: 'تساعدك الأقسام على تنظيم هيكل شركتك وتجميع الموظفين حسب الوظيفة.',
      tip1: 'قم بإنشاء أقسام قبل إضافة المناصب والموظفين.',
      tip2: 'يجب أن تكون أسماء الأقسام واضحة ووصفية.'
    }
  },
  positions: {
    list: {
      title: 'إدارة المناصب',
      content: 'تحدد المناصب الأدوار داخل كل قسم. يجب إنشاء مناصب قبل تعيين الموظفين لها.',
      tip1: 'كل منصب ينتمي إلى قسم محدد.',
      tip2: 'قم بإنشاء مجموعة متنوعة من المناصب لتعكس هيكل مؤسستك.'
    }
  },
  reports: {
    overview: {
      title: 'نظرة عامة على التقارير',
      content: 'توفر التقارير رؤى حول القوى العاملة وهيكل المؤسسة. قم بإنشاء تقارير لتحليل البيانات واتخاذ قرارات مستنيرة.',
      step1: 'حدد نوع التقرير من القائمة المنسدلة.',
      step2: 'قم بتكوين أي مرشحات أو معلمات.',
      step3: 'انقر على "إنشاء تقرير" لعرض النتائج.',
      step4: 'استخدم خيارات التصدير لحفظ التقارير بتنسيقات مختلفة.'
    }
  },
  settings: {
    general: {
      title: 'الإعدادات العامة',
      content: 'قم بتكوين تفضيلات التطبيق، بما في ذلك اللغة والسمة وإعدادات الإشعارات.',
      tip1: 'قم بالتبديل إلى الوضع الداكن لتقليل إجهاد العين في البيئات منخفضة الإضاءة.',
      tip2: 'اختر اللغة التي تناسب فريقك بشكل أفضل.'
    },
    account: {
      title: 'إعدادات الحساب',
      content: 'إدارة حساب المستخدم الخاص بك، بما في ذلك معلومات ملفك الشخصي وإعدادات الأمان.',
      step1: 'قم بتحديث معلومات ملفك الشخصي لإبقائها حديثة.',
      step2: 'قم بتغيير كلمة المرور بانتظام للحصول على أمان أفضل.',
      step3: 'قم بتكوين تفضيلات الإشعارات الخاصة بك.'
    }
  },
  navigation: {
    sidebar: {
      title: 'قائمة التنقل',
      content: 'تمنحك القائمة الجانبية وصولاً سريعًا إلى جميع أجزاء التطبيق.',
      tip1: 'انقر على أي عنصر قائمة للانتقال إلى ذلك القسم.',
      tip2: 'يمكنك طي الشريط الجانبي على الشاشات الأصغر بالنقر على أيقونة القائمة.'
    }
  }
};