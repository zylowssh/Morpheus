from kivy.app import App
from kivy.uix.screenmanager import ScreenManager, Screen
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.gridlayout import GridLayout
from kivy.uix.label import Label
from kivy.uix.button import Button
from kivy.uix.switch import Switch
from kivy.uix.slider import Slider
from kivy.uix.popup import Popup
from kivy.clock import Clock
from kivy.graphics import Color, Rectangle, Line
from kivy.properties import NumericProperty, StringProperty, BooleanProperty
from datetime import datetime, timedelta
import random
import math

class SleepCycleCalculator:
    """Calcule les cycles de sommeil et détermine les moments optimaux de réveil"""
    CYCLE_DURATION = 90  # minutes
    LIGHT_SLEEP_WINDOW = 15  # minutes avant/après chaque cycle
    
    def __init__(self):
        self.sleep_start = None
        self.target_wake_time = None
    
    def set_sleep_start(self, time):
        self.sleep_start = time
    
    def set_target_wake_time(self, time):
        self.target_wake_time = time
    
    def calculate_optimal_wake_times(self, wake_time, num_times=3):
        """Calcule les meilleurs moments pour se réveiller avant l'heure cible"""
        optimal_times = []
        for i in range(1, num_times + 1):
            time = wake_time - timedelta(minutes=self.CYCLE_DURATION * i)
            optimal_times.append(time)
        return sorted(optimal_times, reverse=True)
    
    def get_current_sleep_phase(self, sleep_start):
        """Estime la phase de sommeil actuelle"""
        if not sleep_start:
            return "Éveillé"
        
        elapsed = (datetime.now() - sleep_start).total_seconds() / 60
        cycle_position = elapsed % self.CYCLE_DURATION
        
        if cycle_position < 15:
            return "Sommeil léger"
        elif cycle_position < 60:
            return "Sommeil profond"
        elif cycle_position < 75:
            return "Sommeil très profond"
        else:
            return "Sommeil léger (REM)"
    
    def should_wake_up(self, current_time):
        """Détermine si c'est un bon moment pour réveiller l'utilisateur"""
        if not self.sleep_start or not self.target_wake_time:
            return False
        
        if current_time < self.target_wake_time - timedelta(minutes=30):
            return False
        
        if current_time > self.target_wake_time:
            return True
        
        elapsed = (current_time - self.sleep_start).total_seconds() / 60
        cycle_position = elapsed % self.CYCLE_DURATION
        
        # Réveil optimal en sommeil léger
        return cycle_position < self.LIGHT_SLEEP_WINDOW or cycle_position > (self.CYCLE_DURATION - self.LIGHT_SLEEP_WINDOW)


class SleepMonitor:
    """Simule la détection du sommeil via les capteurs"""
    def __init__(self):
        self.is_sleeping = False
        self.movement_data = []
        self.sensitivity = 0.5
    
    def process_sensor_data(self):
        """Simule l'analyse des données des capteurs (accéléromètre, etc.)"""
        # En production, ceci analyserait les vraies données des capteurs
        movement = random.random()
        self.movement_data.append(movement)
        
        if len(self.movement_data) > 20:
            self.movement_data.pop(0)
        
        avg_movement = sum(self.movement_data) / len(self.movement_data)
        self.is_sleeping = avg_movement < self.sensitivity
        
        return self.is_sleeping
    
    def get_sleep_quality(self):
        """Retourne un score de qualité de sommeil"""
        if not self.movement_data:
            return 0
        avg = sum(self.movement_data) / len(self.movement_data)
        return max(0, min(100, int((1 - avg) * 100)))


class MainScreen(Screen):
    """Écran principal avec le réveil"""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.layout = BoxLayout(orientation='vertical', padding=20, spacing=15)
        
        # Titre
        title = Label(
            text='[b]MORPHEUS[/b]',
            markup=True,
            font_size='32sp',
            size_hint=(1, 0.1),
            color=(0.3, 0.6, 1, 1)
        )
        self.layout.add_widget(title)
        
        # Heure actuelle
        self.current_time_label = Label(
            text='',
            font_size='48sp',
            size_hint=(1, 0.15),
            bold=True
        )
        self.layout.add_widget(self.current_time_label)
        
        # Heure de réveil
        alarm_box = BoxLayout(orientation='horizontal', size_hint=(1, 0.1), spacing=10)
        alarm_box.add_widget(Label(text='Réveil:', font_size='20sp'))
        self.alarm_time_label = Label(text='--:--', font_size='24sp', bold=True)
        alarm_box.add_widget(self.alarm_time_label)
        self.layout.add_widget(alarm_box)
        
        # État du sommeil
        self.sleep_status = Label(
            text='État: Éveillé',
            font_size='18sp',
            size_hint=(1, 0.08),
            color=(0.8, 0.8, 0.8, 1)
        )
        self.layout.add_widget(self.sleep_status)
        
        # Phase de sommeil
        self.sleep_phase = Label(
            text='Phase: --',
            font_size='16sp',
            size_hint=(1, 0.08),
            color=(0.6, 0.8, 1, 1)
        )
        self.layout.add_widget(self.sleep_phase)
        
        # Boutons
        btn_layout = GridLayout(cols=2, size_hint=(1, 0.3), spacing=10)
        
        set_alarm_btn = Button(
            text='Régler le réveil',
            background_color=(0.2, 0.6, 0.8, 1),
            font_size='18sp'
        )
        set_alarm_btn.bind(on_press=self.show_alarm_settings)
        btn_layout.add_widget(set_alarm_btn)
        
        start_monitoring_btn = Button(
            text='Démarrer\nla surveillance',
            background_color=(0.3, 0.7, 0.3, 1),
            font_size='18sp'
        )
        start_monitoring_btn.bind(on_press=self.start_sleep_monitoring)
        btn_layout.add_widget(start_monitoring_btn)
        
        stats_btn = Button(
            text='Statistiques',
            background_color=(0.6, 0.4, 0.8, 1),
            font_size='18sp'
        )
        stats_btn.bind(on_press=self.show_stats)
        btn_layout.add_widget(stats_btn)
        
        stop_btn = Button(
            text='Arrêter',
            background_color=(0.8, 0.3, 0.3, 1),
            font_size='18sp'
        )
        stop_btn.bind(on_press=self.stop_monitoring)
        btn_layout.add_widget(stop_btn)
        
        self.layout.add_widget(btn_layout)
        
        # Informations
        info = Label(
            text='Morpheus analyse vos cycles de sommeil\npour un réveil optimal',
            font_size='14sp',
            size_hint=(1, 0.1),
            color=(0.5, 0.5, 0.5, 1)
        )
        self.layout.add_widget(info)
        
        self.add_widget(self.layout)
        
        # Timer pour mise à jour
        Clock.schedule_interval(self.update_time, 1)
    
    def update_time(self, dt):
        now = datetime.now()
        self.current_time_label.text = now.strftime('%H:%M:%S')
        
        app = App.get_running_app()
        if app.monitoring_active:
            phase = app.calculator.get_current_sleep_phase(app.sleep_start_time)
            self.sleep_phase.text = f'Phase: {phase}'
            
            if app.monitor.process_sensor_data():
                self.sleep_status.text = 'État: En sommeil 😴'
                self.sleep_status.color = (0.3, 0.8, 0.3, 1)
            else:
                self.sleep_status.text = 'État: Mouvement détecté'
                self.sleep_status.color = (0.9, 0.6, 0.2, 1)
            
            if app.calculator.should_wake_up(now):
                self.trigger_alarm()
    
    def show_alarm_settings(self, instance):
        self.manager.current = 'alarm_settings'
    
    def start_sleep_monitoring(self, instance):
        app = App.get_running_app()
        if not app.alarm_time:
            self.show_popup('Erreur', 'Veuillez d\'abord régler le réveil')
            return
        
        app.monitoring_active = True
        app.sleep_start_time = datetime.now()
        app.calculator.set_sleep_start(app.sleep_start_time)
        self.show_popup('Démarré', 'La surveillance du sommeil a commencé.\nBonne nuit! 🌙')
    
    def stop_monitoring(self, instance):
        app = App.get_running_app()
        app.monitoring_active = False
        self.sleep_status.text = 'État: Éveillé'
        self.sleep_status.color = (0.8, 0.8, 0.8, 1)
        self.sleep_phase.text = 'Phase: --'
    
    def show_stats(self, instance):
        self.manager.current = 'stats'
    
    def trigger_alarm(self):
        app = App.get_running_app()
        app.monitoring_active = False
        content = BoxLayout(orientation='vertical', padding=10, spacing=10)
        content.add_widget(Label(
            text='⏰ RÉVEIL ⏰\n\nC\'est le moment optimal\npour vous réveiller!',
            font_size='20sp'
        ))
        close_btn = Button(text='Arrêter le réveil', size_hint=(1, 0.3))
        content.add_widget(close_btn)
        
        popup = Popup(
            title='Réveil',
            content=content,
            size_hint=(0.8, 0.5),
            auto_dismiss=False
        )
        close_btn.bind(on_press=popup.dismiss)
        popup.open()
    
    def show_popup(self, title, message):
        content = BoxLayout(orientation='vertical', padding=10, spacing=10)
        content.add_widget(Label(text=message))
        close_btn = Button(text='OK', size_hint=(1, 0.3))
        content.add_widget(close_btn)
        
        popup = Popup(title=title, content=content, size_hint=(0.7, 0.4))
        close_btn.bind(on_press=popup.dismiss)
        popup.open()


class AlarmSettingsScreen(Screen):
    """Écran de configuration du réveil"""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.layout = BoxLayout(orientation='vertical', padding=20, spacing=15)
        
        title = Label(
            text='[b]Régler le réveil[/b]',
            markup=True,
            font_size='28sp',
            size_hint=(1, 0.1)
        )
        self.layout.add_widget(title)
        
        # Heure
        hour_box = BoxLayout(orientation='horizontal', size_hint=(1, 0.1), spacing=10)
        hour_box.add_widget(Label(text='Heure:', font_size='18sp'))
        self.hour_slider = Slider(min=0, max=23, value=7, step=1)
        self.hour_label = Label(text='07', font_size='24sp', bold=True, size_hint=(0.3, 1))
        self.hour_slider.bind(value=self.update_hour_label)
        hour_box.add_widget(self.hour_slider)
        hour_box.add_widget(self.hour_label)
        self.layout.add_widget(hour_box)
        
        # Minutes
        min_box = BoxLayout(orientation='horizontal', size_hint=(1, 0.1), spacing=10)
        min_box.add_widget(Label(text='Minutes:', font_size='18sp'))
        self.min_slider = Slider(min=0, max=59, value=0, step=1)
        self.min_label = Label(text='00', font_size='24sp', bold=True, size_hint=(0.3, 1))
        self.min_slider.bind(value=self.update_min_label)
        min_box.add_widget(self.min_slider)
        min_box.add_widget(self.min_label)
        self.layout.add_widget(min_box)
        
        # Fenêtre de réveil
        window_box = BoxLayout(orientation='horizontal', size_hint=(1, 0.1), spacing=10)
        window_box.add_widget(Label(
            text='Fenêtre de réveil\n(minutes avant):',
            font_size='16sp'
        ))
        self.window_slider = Slider(min=0, max=60, value=30, step=5)
        self.window_label = Label(text='30 min', font_size='18sp', size_hint=(0.3, 1))
        self.window_slider.bind(value=self.update_window_label)
        window_box.add_widget(self.window_slider)
        window_box.add_widget(self.window_label)
        self.layout.add_widget(window_box)
        
        # Sensibilité
        sens_box = BoxLayout(orientation='horizontal', size_hint=(1, 0.1), spacing=10)
        sens_box.add_widget(Label(text='Sensibilité:', font_size='16sp'))
        self.sens_slider = Slider(min=0.1, max=0.9, value=0.5, step=0.1)
        self.sens_label = Label(text='Moyenne', font_size='18sp', size_hint=(0.3, 1))
        self.sens_slider.bind(value=self.update_sens_label)
        sens_box.add_widget(self.sens_slider)
        sens_box.add_widget(self.sens_label)
        self.layout.add_widget(sens_box)
        
        # Info
        info = Label(
            text='La fenêtre de réveil permet de vous réveiller\nlors d\'une phase de sommeil léger',
            font_size='14sp',
            size_hint=(1, 0.15),
            color=(0.6, 0.6, 0.6, 1)
        )
        self.layout.add_widget(info)
        
        # Boutons
        btn_box = BoxLayout(orientation='horizontal', size_hint=(1, 0.15), spacing=10)
        
        save_btn = Button(
            text='Enregistrer',
            background_color=(0.3, 0.7, 0.3, 1),
            font_size='18sp'
        )
        save_btn.bind(on_press=self.save_alarm)
        btn_box.add_widget(save_btn)
        
        cancel_btn = Button(
            text='Annuler',
            background_color=(0.6, 0.6, 0.6, 1),
            font_size='18sp'
        )
        cancel_btn.bind(on_press=self.go_back)
        btn_box.add_widget(cancel_btn)
        
        self.layout.add_widget(btn_box)
        self.add_widget(self.layout)
    
    def update_hour_label(self, instance, value):
        self.hour_label.text = f'{int(value):02d}'
    
    def update_min_label(self, instance, value):
        self.min_label.text = f'{int(value):02d}'
    
    def update_window_label(self, instance, value):
        self.window_label.text = f'{int(value)} min'
    
    def update_sens_label(self, instance, value):
        if value < 0.3:
            text = 'Faible'
        elif value < 0.7:
            text = 'Moyenne'
        else:
            text = 'Élevée'
        self.sens_label.text = text
    
    def save_alarm(self, instance):
        app = App.get_running_app()
        hour = int(self.hour_slider.value)
        minute = int(self.min_slider.value)
        
        now = datetime.now()
        alarm = now.replace(hour=hour, minute=minute, second=0, microsecond=0)
        if alarm <= now:
            alarm += timedelta(days=1)
        
        app.alarm_time = alarm
        app.wake_window = int(self.window_slider.value)
        app.monitor.sensitivity = self.sens_slider.value
        app.calculator.set_target_wake_time(alarm)
        
        main_screen = self.manager.get_screen('main')
        main_screen.alarm_time_label.text = f'{hour:02d}:{minute:02d}'
        
        self.show_popup('Confirmé', f'Réveil réglé pour {hour:02d}:{minute:02d}')
        self.manager.current = 'main'
    
    def go_back(self, instance):
        self.manager.current = 'main'
    
    def show_popup(self, title, message):
        content = BoxLayout(orientation='vertical', padding=10, spacing=10)
        content.add_widget(Label(text=message))
        close_btn = Button(text='OK', size_hint=(1, 0.3))
        content.add_widget(close_btn)
        
        popup = Popup(title=title, content=content, size_hint=(0.7, 0.3))
        close_btn.bind(on_press=popup.dismiss)
        popup.open()


class StatsScreen(Screen):
    """Écran des statistiques"""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.layout = BoxLayout(orientation='vertical', padding=20, spacing=15)
        
        title = Label(
            text='[b]Statistiques de sommeil[/b]',
            markup=True,
            font_size='28sp',
            size_hint=(1, 0.1)
        )
        self.layout.add_widget(title)
        
        self.stats_label = Label(
            text='',
            font_size='16sp',
            size_hint=(1, 0.6),
            halign='left',
            valign='top'
        )
        self.stats_label.bind(size=self.stats_label.setter('text_size'))
        self.layout.add_widget(self.stats_label)
        
        back_btn = Button(
            text='Retour',
            size_hint=(1, 0.1),
            background_color=(0.6, 0.6, 0.6, 1),
            font_size='18sp'
        )
        back_btn.bind(on_press=self.go_back)
        self.layout.add_widget(back_btn)
        
        self.add_widget(self.layout)
        Clock.schedule_interval(self.update_stats, 2)
    
    def update_stats(self, dt):
        app = App.get_running_app()
        
        if app.sleep_start_time and app.monitoring_active:
            duration = datetime.now() - app.sleep_start_time
            hours = int(duration.total_seconds() // 3600)
            minutes = int((duration.total_seconds() % 3600) // 60)
            
            quality = app.monitor.get_sleep_quality()
            phase = app.calculator.get_current_sleep_phase(app.sleep_start_time)
            
            elapsed_min = duration.total_seconds() / 60
            cycles = int(elapsed_min // 90)
            
            stats_text = f'''
Durée actuelle: {hours}h {minutes}min

Qualité du sommeil: {quality}%

Phase actuelle: {phase}

Cycles complétés: {cycles}

Prochaine phase légère: 
{(cycles + 1) * 90 - int(elapsed_min)} minutes

État: {'Endormi' if app.monitor.is_sleeping else 'Mouvement'}
            '''
        else:
            stats_text = '''
Aucune session de sommeil active.

Démarrez la surveillance pour 
voir vos statistiques.
            '''
        
        self.stats_label.text = stats_text.strip()
    
    def go_back(self, instance):
        self.manager.current = 'main'


class MorpheusApp(App):
    """Application principale"""
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.calculator = SleepCycleCalculator()
        self.monitor = SleepMonitor()
        self.alarm_time = None
        self.sleep_start_time = None
        self.monitoring_active = False
        self.wake_window = 30
    
    def build(self):
        sm = ScreenManager()
        sm.add_widget(MainScreen(name='main'))
        sm.add_widget(AlarmSettingsScreen(name='alarm_settings'))
        sm.add_widget(StatsScreen(name='stats'))
        return sm


if __name__ == '__main__':
    MorpheusApp().run()