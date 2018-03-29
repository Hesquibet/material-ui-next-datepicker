import * as React from 'react'
import SwipeableViews from 'react-swipeable-views'
import {virtualize} from 'react-swipeable-views-utils'
import {TransitionGroup, Transition} from 'react-transition-group'
import * as classnames from 'classnames'
import {withStyles, Theme, StyledComponentProps} from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import Card from 'material-ui/Card'
import Button from 'material-ui/Button'
import IconButton from 'material-ui/IconButton'
import {ChevronLeft as ChevronLeftIcon, ChevronRight as ChevronRightIcon} from 'material-ui-icons'

import * as DateUtil from './util/date'
const VirtualizedSwipeableViews = virtualize(SwipeableViews)

const styles = (theme:Theme):Record<string, React.CSSProperties> => ({
  popperEnter: {
    pointerEvents: 'none',
    transform: 'scaleY(0.5)',
    opacity: 0
  },
  popperEntered: {
    pointerEvents: 'all',
    transform: 'scaleY(1)',
    opacity: 1,
    transition: theme.transitions.create(['opacity', 'transform'], {duration:300})
  },
  popperExit: {
    pointerEvents: 'all',
    transform: 'scaleY(1)',
    opacity: 1
  },
  popperExited: {
    pointerEvents: 'none',
    transform: 'scaleY(0.5)',
    opacity: 0,
    transition: theme.transitions.create(['opacity', 'transform'], {duration:300})
  },
  card: {
    position: 'absolute',
    marginTop: '4px',
    marginBottom: '12px'
  },
  cardEnter: {
    opacity: 1
  },
  cardExit: {
    opacity: 0
  },
  calendarContainer: {
    width: (48 * 7) + 'px'
  },
  calendarControl: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  calendarMonthTitle: {
    fontSize: '1rem',
    fontWeight: 500,
    textTransform: 'none'
  },
  years: {
    height: '48px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  invalidInput: {
    color: theme.palette.grey.A200
  },
  week: {
    display: 'flex'
  },
  weekDay: {
    height: '48px',
    width: '48px',
    color: theme.palette.grey.A200,
    fontWeight: 300,
    lineHeight: '48px',
    textAlign: 'center'
  },
  selectedDay: {
    border: '5px solid white',
    backgroundColor: theme.palette.primary.dark
  },
  selectedDayText: {
    color: 'white'
  },
  emptyDate: {
    height: '48px',
    width: '48px'
  }
})
@(withStyles as any)(styles)
class DateModal extends React.Component<DateModalProps, DateModalState> {
  
 

  constructor(props) {
    super(props)
    const now = new Date()
    var date = new Date(now.getTime())
    const {min, max} = props
    if(max && now.getTime() > max.getTime()) {
      date = new Date(max.getTime())
    } else if(min && now.getTime() < min.getTime()) {
      date = new Date(min.getTime())
    }
    this.state = {
      mode: 'month',
      month: date.getMonth(),
      year: date.getFullYear(),
      yearIndex: Math.floor(date.getFullYear() / 18)
    }
  }
  componentDidUpdate(prevProps, prevState) {
    const {calendarShow, value} = this.props
    if(!prevProps.calendarShow && calendarShow && value) {
      this.setState({
        month: value.getMonth(),
        year: value.getFullYear()
      })
    }
  }
  selectDate = (date:Date) => {
    this.props.onChange(date)
  }
  showYearsCalendar = () => {
    const {year} = this.state
    this.setState({
      mode: 'year',
      yearIndex: Math.floor(year / 18)
    })
  }
  selectCalendarYear = (year:number) => {
    const {min, max} = this.props
    const {month} = this.state
    this.setState({
      mode: 'month',
      year,
      month: min && month < min.getMonth() && year === min.getFullYear()? min.getMonth():(
        max && month > max.getMonth() && year === max.getFullYear()? max.getMonth():month
      )
    })
  }
  previousYearsValid = () => {
    const {min} = this.props
    const {yearIndex} = this.state
    return yearIndex >= 1 && (min === undefined || yearIndex >= Math.ceil(min.getFullYear() / 18))
  }
  previousYears = () => {
    const {min} = this.props
    const {yearIndex} = this.state
    this.setState({
      yearIndex: yearIndex - 1
    })
  }
  nextYearsValid = () => {
    const {max} = this.props
    const {yearIndex} = this.state
    return max === undefined || yearIndex < Math.floor(max.getFullYear() / 18)
  }
  nextYears = () => {
    const {yearIndex} = this.state
    this.setState({
      yearIndex: yearIndex + 1
    })
  }
  yearInvalid = (currentYear:number) => {
    const {min, max} = this.props
    const {month, year} = this.state
    return year === currentYear || (min && currentYear < min.getFullYear()) || (max && currentYear > max.getFullYear())
  }
  previousMonthValid = () => {
    const {min} = this.props
    const {month, year} = this.state
    return min === undefined || (month > min.getMonth() || year > min.getFullYear())
  }
  previousMonth = () => {
    const {month, year} = this.state
    this.setState({
      year: year - (month <= 0? 1:0),
      month: month <= 0? 11:month - 1
    })
  }
  nextMonthValid = () => {
    const {max} = this.props
    const {month, year} = this.state
    return max === undefined || (month < max.getMonth() || year < max.getFullYear())
  }
  nextMonth = () => {
    const {month, year} = this.state
    this.setState({
      year: year + (month >= 11? 1:0),
      month: month >= 11? 0:month + 1
    })
  }
  dayInvalid = (date:Date) => {
    const {value, min, max} = this.props
    return (value && DateUtil.sameDay(date, value)) || (min && date.getTime() < min.setHours(0, 0, 0, 0) || (max && date.getTime() > max.setHours(0, 0, 0, 0)))
  }
  generateYearCalendar = (index:number) => {
    const years:number[][] = []
    var counter = 0
    for(var year = index * 18; year < (index + 1) * 18; year++) {
      if(!years[Math.floor(counter / 3)]) {
        years[Math.floor(counter / 3)] = [year]
      } else {
        years[Math.floor(counter / 3)] = [...years[Math.floor(counter / 3)], year]
      }
      counter++
    }
    return years
  }
  generateMonthCalendar = (index:number) => {
    const calendarFocus = {
      year: Math.floor(index / 12),
      month: index % 12
    }
    const firstDay = new Date(calendarFocus.year, calendarFocus.month, 1)
    const daysInWeekInMonth:Date[][] = [Array.apply(undefined, {length:this.props.dateFormat.weekMapping[firstDay.getDay()]})]
    var counter = this.props.dateFormat.weekMapping[firstDay.getDay()] 
    for(var day = firstDay; day.getMonth() === calendarFocus.month; day = new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1)) {
      if(!daysInWeekInMonth[Math.floor(counter / 7)]) {
        daysInWeekInMonth[Math.floor(counter / 7)] = [new Date(day.getFullYear(), day.getMonth(), day.getDate())]
      } else {
        daysInWeekInMonth[Math.floor(counter / 7)] = [...daysInWeekInMonth[Math.floor(counter / 7)], new Date(day.getFullYear(), day.getMonth(), day.getDate())]
      }
      counter++
    }
    return daysInWeekInMonth
  }
  render() {
    const {classes, value, calendarShow} = this.props
    const {mode, year, month, yearIndex} = this.state
    return (
      <Transition in={calendarShow} timeout={300}>
        {(state) =>
          <div className={classnames({
            [classes.popperEnter]: (state === 'exited' || state === 'entering') && calendarShow,
            [classes.popperEntered]: 'entered' && calendarShow,
            [classes.popperExit]: (state === 'entered' || state === 'exiting') && !calendarShow,
            [classes.popperExited]: state === 'exited' && !calendarShow
          })}>
            <Transition in={mode === 'month'} unmountOnExit timeout={0}>
              {(state) => 
                <Card key='month-calendar' elevation={8} className={classnames(classes.card, {
                  [classes.cardEnter]: (state === 'entered' || state === 'entering') && mode === 'month',
                  [classes.cardExit]: (state === 'exited' || state === 'exiting') && mode !== 'month'
                })}>
                  <div className={classes.calendarControl}>
                    <IconButton disabled={!this.previousMonthValid()} onClick={this.previousMonth}><ChevronLeftIcon/></IconButton>
                    <Button onClick={this.showYearsCalendar} className={classes.calendarMonthTitle}>
                      {this.props.dateFormat.month[month].long + ', ' + year}
                    </Button>
                    <IconButton disabled={!this.nextMonthValid()} onClick={this.nextMonth}><ChevronRightIcon/></IconButton>
                  </div>
                  <div className={classes.week}>
                    {this.props.dateFormat.day.map((day)=>{return day.short.substring(0,1) }).map((day, index) =>
                      <Typography key={'weeklabel-' + index} className={classes.weekDay} variant='body1'>{day}</Typography>
                    )}
                  </div>
                  <VirtualizedSwipeableViews className={classes.calendarContainer} index={year * 12 + month} animateHeight slideRenderer={({index}) =>
                    <div key={index} className={classes.calendarContainer}>
                      {this.generateMonthCalendar(index).map((week, index) =>
                        <div className={classes.week} key={'week-' + index}>
                          {week.map((date, index) =>
                            date? <IconButton disabled={this.dayInvalid(date)} className={classnames({[classes.selectedDay]:value && DateUtil.sameDay(date, value)})} onClick={() => this.selectDate(date)} key={'day-' + index}>
                              <Typography className={classnames({[classes.selectedDayText]:value && DateUtil.sameDay(date, value), [classes.invalidInput]:this.dayInvalid(date)})} variant='body1'>{date.getDate()}</Typography>
                            </IconButton> : 
                            <div className={classes.emptyDate} key={'day-' + index}/>
                          )}
                        </div>
                      )}
                    </div>
                  }/>
                </Card>
              }
            </Transition>
            <Transition in={mode === 'year'} unmountOnExit timeout={0}>
              {(state) =>
                <Card key='year-calendar' elevation={8} className={classnames(classes.card, {
                  [classes.cardEnter]: (state === 'entered' || state === 'entering') && mode === 'year',
                  [classes.cardExit]: (state === 'exited' || state === 'exiting') && mode !== 'year'
                })}>
                  <div className={classes.calendarControl}>
                    <IconButton disabled={!this.previousYearsValid()} onClick={this.previousYears}><ChevronLeftIcon/></IconButton>
                    <Typography className={classes.calendarMonthTitle} variant='subheading'>
                      {(yearIndex * 18) + ' - ' + (yearIndex * 18 + 17)}
                    </Typography>
                    <IconButton disabled={!this.nextYearsValid()} onClick={this.nextYears}><ChevronRightIcon/></IconButton>
                  </div>
                  <VirtualizedSwipeableViews className={classes.calendarContainer} index={yearIndex} animateHeight slideRenderer={({index}) =>
                    <div key={index} className={classes.calendarContainer}>
                      {this.generateYearCalendar(index).map((years, index) =>
                        <div className={classes.years} key={'years-' + index}>
                          {years.map((currentYear, index) =>
                            <Button variant={year === currentYear? 'raised':'flat'} disabled={this.yearInvalid(currentYear)} onClick={() => this.selectCalendarYear(currentYear)} key={'year-' + index}>
                              <Typography className={classnames({[classes.invalidInput]:this.yearInvalid(currentYear)})} variant='body1'>{currentYear}</Typography>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  }/>
                </Card>
              }
            </Transition>
          </div>
        }
      </Transition>
    )
  }
}
export interface DateModalProps extends React.Props<{}>, StyledComponentProps {
  value: Date
  onChange: (value:Date) => void
  calendarShow: boolean;
  dateFormat? : DateUtil.DateFormat;
  min?: Date
  max?: Date
}
export interface DateModalState {
  mode: 'year' | 'month'
  month: number
  year: number
  yearIndex: number
}

export default DateModal